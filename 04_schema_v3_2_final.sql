-- V3.2 reconciliation: quotation is an explicit platform module because the application has a /quotations route, quotation CRUD/use-cases, and quotation permissions.
-- =============================================================================
-- V3.2 FINAL — MULTI-VENDOR EVENT VENDOR MANAGEMENT PLATFORM
-- PostgreSQL / Supabase
--
-- Vendor types:
--   Catering, Dekorasi, MUA, Photography, Wedding Organizer
--
-- Prinsip:
-- 1. Core data dipakai bersama semua vendor.
-- 2. Modul dan workflow dikonfigurasi per vendor category.
-- 3. Data khusus vendor dipisah dari core.
-- 4. Semua data bisnis terisolasi dengan tenant_id + RLS.
-- 5. Data publik marketplace dipisahkan dari data privat vendor.
-- 6. Inventory memakai stock ledger + trigger saldo.
-- 7. Schema dibuat sedapat mungkin aman untuk dijalankan ulang.
-- =============================================================================

BEGIN;

-- =============================================================================
-- 1. EXTENSIONS
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- 2. ENUM TYPES (IDEMPOTENT)
-- =============================================================================

DO $$ BEGIN
    CREATE TYPE vendor_status_enum AS ENUM ('active', 'suspended', 'pending_approval');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE user_role_enum AS ENUM ('owner', 'admin', 'staff', 'freelancer');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE pricing_type_enum AS ENUM ('fixed_package', 'per_pax', 'per_hour', 'custom_quote');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE booking_status_enum AS ENUM ('pending', 'confirmed', 'in_progress', 'completed', 'canceled');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_status_enum AS ENUM ('unpaid', 'dp_paid', 'fully_paid', 'refunded');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE transaction_type_enum AS ENUM ('income', 'expense', 'payout');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- =============================================================================
-- 3. HELPER FUNCTIONS
-- =============================================================================

CREATE OR REPLACE FUNCTION current_tenant_id()
RETURNS UUID
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN (
        NULLIF(
            current_setting('request.jwt.claims', true)::json
                ->'app_metadata'->>'tenant_id',
            ''
        )
    )::UUID;
EXCEPTION
    WHEN OTHERS THEN
        RETURN NULL;
END;
$$;

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- Memastikan FK lintas tenant tidak dapat dibuat secara tidak sengaja.
CREATE OR REPLACE FUNCTION enforce_same_tenant()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    parent_tenant UUID;
    parent_table TEXT := TG_ARGV[0];
    parent_id UUID;
BEGIN
    parent_id := (to_jsonb(NEW)->>TG_ARGV[2])::UUID;

    IF parent_id IS NULL THEN
        RETURN NEW;
    END IF;

    -- SECURITY DEFINER is required here: otherwise RLS can hide a parent row
    -- belonging to another tenant and make the cross-tenant check appear valid.
    EXECUTE format(
        'SELECT tenant_id FROM %I WHERE id = $1',
        parent_table
    )
    INTO parent_tenant
    USING parent_id;

    IF parent_tenant IS NULL THEN
        RAISE EXCEPTION 'Referenced tenant-owned record was not found';
    END IF;

    IF NEW.tenant_id IS DISTINCT FROM parent_tenant THEN
        RAISE EXCEPTION 'Cross-tenant reference is not allowed';
    END IF;

    RETURN NEW;
END;
$$;

-- =============================================================================
-- 4. TENANT, VENDOR CATEGORY & PROFILE
-- =============================================================================

CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    logo_url TEXT,
    banner_url TEXT,
    status vendor_status_enum NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS vendor_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS vendor_profiles (
    tenant_id UUID PRIMARY KEY REFERENCES tenants(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES vendor_categories(id) ON DELETE RESTRICT,
    description TEXT,
    city VARCHAR(100) NOT NULL,
    address TEXT,
    minimum_price NUMERIC(15,2) NOT NULL DEFAULT 0 CHECK (minimum_price >= 0),
    gallery_portfolio JSONB NOT NULL DEFAULT '[]'::jsonb,
    social_media JSONB NOT NULL DEFAULT '{}'::jsonb,
    bank_account_info JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Data aman untuk marketplace. Jangan expose bank_account_info dari vendor_profiles.
CREATE TABLE IF NOT EXISTS vendor_public_listings (
    tenant_id UUID PRIMARY KEY REFERENCES tenants(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES vendor_categories(id) ON DELETE RESTRICT,
    display_name VARCHAR(255) NOT NULL,
    slug VARCHAR(150) UNIQUE NOT NULL,
    description TEXT,
    city VARCHAR(100),
    logo_url TEXT,
    banner_url TEXT,
    gallery JSONB NOT NULL DEFAULT '[]'::jsonb,
    social_media JSONB NOT NULL DEFAULT '{}'::jsonb,
    minimum_price NUMERIC(15,2) NOT NULL DEFAULT 0 CHECK (minimum_price >= 0),
    is_published BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- 5. USERS / TEAM
-- =============================================================================

CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone_number VARCHAR(50),
    role user_role_enum NOT NULL DEFAULT 'staff',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(tenant_id, email)
);

-- =============================================================================
-- 6. PLATFORM MODULES, VENDOR MODULES, ROLES
-- =============================================================================

CREATE TABLE IF NOT EXISTS platform_modules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    is_core BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS vendor_category_modules (
    vendor_category_id UUID NOT NULL REFERENCES vendor_categories(id) ON DELETE CASCADE,
    module_id UUID NOT NULL REFERENCES platform_modules(id) ON DELETE CASCADE,
    is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    display_order INT NOT NULL DEFAULT 0,
    PRIMARY KEY (vendor_category_id, module_id)
);

CREATE TABLE IF NOT EXISTS role_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role user_role_enum NOT NULL,
    module_id UUID NOT NULL REFERENCES platform_modules(id) ON DELETE CASCADE,
    can_view BOOLEAN NOT NULL DEFAULT FALSE,
    can_create BOOLEAN NOT NULL DEFAULT FALSE,
    can_update BOOLEAN NOT NULL DEFAULT FALSE,
    can_delete BOOLEAN NOT NULL DEFAULT FALSE,
    can_export BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(role, module_id)
);

-- =============================================================================
-- 7. CLIENTS
-- =============================================================================

CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone_number VARCHAR(50),
    company_name VARCHAR(255),
    address TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- 8. SERVICES / PACKAGES / PROMO
-- =============================================================================

CREATE TABLE IF NOT EXISTS vendor_services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    pricing_type pricing_type_enum NOT NULL DEFAULT 'fixed_package',
    base_price NUMERIC(15,2) NOT NULL DEFAULT 0 CHECK (base_price >= 0),
    min_order_qty INT NOT NULL DEFAULT 1 CHECK (min_order_qty >= 1),
    specifications JSONB NOT NULL DEFAULT '{}'::jsonb,
    image_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS promo_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL,
    discount_amount NUMERIC(15,2) NOT NULL DEFAULT 0 CHECK (discount_amount >= 0),
    discount_type VARCHAR(20) NOT NULL DEFAULT 'fixed'
        CHECK (discount_type IN ('fixed', 'percentage')),
    max_uses INT NOT NULL DEFAULT 0 CHECK (max_uses >= 0),
    uses_count INT NOT NULL DEFAULT 0 CHECK (uses_count >= 0),
    valid_from TIMESTAMPTZ,
    valid_until TIMESTAMPTZ,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(tenant_id, code)
);

-- =============================================================================
-- 9. BOOKINGS / PROJECTS
-- =============================================================================

CREATE TABLE IF NOT EXISTS vendor_bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    service_id UUID REFERENCES vendor_services(id) ON DELETE SET NULL,
    promo_code_id UUID REFERENCES promo_codes(id) ON DELETE SET NULL,

    client_name VARCHAR(255) NOT NULL,
    client_email VARCHAR(255),
    client_phone VARCHAR(50),

    portal_access_id VARCHAR(255) UNIQUE,
    event_name VARCHAR(255),
    event_date TIMESTAMPTZ NOT NULL,
    event_end_date TIMESTAMPTZ,
    venue_name VARCHAR(255),
    venue_address TEXT,

    quantity INT NOT NULL DEFAULT 1 CHECK (quantity >= 1),
    unit_price NUMERIC(15,2) NOT NULL DEFAULT 0 CHECK (unit_price >= 0),
    discount_amount NUMERIC(15,2) NOT NULL DEFAULT 0 CHECK (discount_amount >= 0),
    total_cost NUMERIC(15,2) NOT NULL DEFAULT 0 CHECK (total_cost >= 0),
    amount_paid NUMERIC(15,2) NOT NULL DEFAULT 0 CHECK (amount_paid >= 0),

    booking_details JSONB NOT NULL DEFAULT '{}'::jsonb,

    status booking_status_enum NOT NULL DEFAULT 'pending',
    payment_status payment_status_enum NOT NULL DEFAULT 'unpaid',

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CHECK (event_end_date IS NULL OR event_end_date >= event_date),
    CHECK (amount_paid <= total_cost OR payment_status = 'refunded')
);

CREATE TABLE IF NOT EXISTS project_team_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    booking_id UUID NOT NULL REFERENCES vendor_bookings(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role_in_project VARCHAR(100) NOT NULL,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(booking_id, profile_id)
);

-- =============================================================================
-- 10. QUOTATIONS
-- =============================================================================

CREATE TABLE IF NOT EXISTS quotations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    booking_id UUID REFERENCES vendor_bookings(id) ON DELETE SET NULL,
    quotation_number VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    subtotal NUMERIC(15,2) NOT NULL DEFAULT 0 CHECK (subtotal >= 0),
    discount_amount NUMERIC(15,2) NOT NULL DEFAULT 0 CHECK (discount_amount >= 0),
    tax_amount NUMERIC(15,2) NOT NULL DEFAULT 0 CHECK (tax_amount >= 0),
    total_amount NUMERIC(15,2) NOT NULL DEFAULT 0 CHECK (total_amount >= 0),
    valid_until DATE,
    status VARCHAR(30) NOT NULL DEFAULT 'draft'
        CHECK (status IN ('draft','sent','accepted','rejected','expired','canceled')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(tenant_id, quotation_number)
);

CREATE TABLE IF NOT EXISTS quotation_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    quotation_id UUID NOT NULL REFERENCES quotations(id) ON DELETE CASCADE,
    service_id UUID REFERENCES vendor_services(id) ON DELETE SET NULL,
    item_name VARCHAR(255) NOT NULL,
    description TEXT,
    quantity NUMERIC(15,3) NOT NULL DEFAULT 1 CHECK (quantity > 0),
    unit_price NUMERIC(15,2) NOT NULL DEFAULT 0 CHECK (unit_price >= 0),
    discount_amount NUMERIC(15,2) NOT NULL DEFAULT 0 CHECK (discount_amount >= 0),
    line_total NUMERIC(15,2) NOT NULL DEFAULT 0 CHECK (line_total >= 0),
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- 11. FINANCE / TRANSACTIONS
-- =============================================================================

CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES vendor_bookings(id) ON DELETE SET NULL,
    invoice_id UUID,
    transaction_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    type transaction_type_enum NOT NULL,
    amount NUMERIC(15,2) NOT NULL CHECK (amount > 0),
    description TEXT NOT NULL,
    payment_method VARCHAR(50),
    reference_id VARCHAR(255),
    proof_of_payment_url TEXT,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- 12. INVOICES
-- =============================================================================

CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    booking_id UUID NOT NULL REFERENCES vendor_bookings(id) ON DELETE CASCADE,
    invoice_number VARCHAR(100) NOT NULL,
    payment_stage VARCHAR(50) NOT NULL
        CHECK (payment_stage IN ('down_payment','installment','final_payment')),
    amount NUMERIC(15,2) NOT NULL CHECK (amount > 0),
    due_date TIMESTAMPTZ NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'unpaid'
        CHECK (status IN ('unpaid','paid','overdue','canceled')),
    paid_at TIMESTAMPTZ,
    payment_link TEXT,
    payment_reference_id VARCHAR(255),
    payment_method VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(tenant_id, invoice_number)
);

ALTER TABLE transactions
    DROP CONSTRAINT IF EXISTS transactions_invoice_id_fkey;

ALTER TABLE transactions
    ADD CONSTRAINT transactions_invoice_id_fkey
    FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE SET NULL;

-- =============================================================================
-- 13. CONTRACTS
-- =============================================================================

CREATE TABLE IF NOT EXISTS contracts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    booking_id UUID NOT NULL REFERENCES vendor_bookings(id) ON DELETE CASCADE,
    contract_number VARCHAR(100) NOT NULL,
    terms_and_conditions TEXT NOT NULL,
    scope_of_work JSONB NOT NULL DEFAULT '[]'::jsonb,
    status VARCHAR(30) NOT NULL DEFAULT 'draft'
        CHECK (status IN ('draft','sent','signed','rejected','void')),
    client_signed_at TIMESTAMPTZ,
    vendor_signed_at TIMESTAMPTZ,
    client_signature_url TEXT,
    vendor_signature_url TEXT,
    pdf_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(tenant_id, contract_number)
);

-- =============================================================================
-- 14. PORTFOLIO
-- =============================================================================

CREATE TABLE IF NOT EXISTS portfolios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    description TEXT,
    event_date DATE,
    venue_name VARCHAR(255),
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    is_published BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(tenant_id, slug)
);

CREATE TABLE IF NOT EXISTS portfolio_media (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    portfolio_id UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
    media_type VARCHAR(20) NOT NULL CHECK (media_type IN ('image','video')),
    media_url TEXT NOT NULL,
    thumbnail_url TEXT,
    caption TEXT,
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- 15. INVENTORY
-- =============================================================================

CREATE TABLE IF NOT EXISTS inventory_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(tenant_id, name)
);

CREATE TABLE IF NOT EXISTS inventory_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    category_id UUID REFERENCES inventory_categories(id) ON DELETE SET NULL,
    sku VARCHAR(100),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    unit VARCHAR(50) NOT NULL DEFAULT 'pcs',
    current_stock NUMERIC(15,3) NOT NULL DEFAULT 0,
    minimum_stock NUMERIC(15,3) NOT NULL DEFAULT 0 CHECK (minimum_stock >= 0),
    purchase_price NUMERIC(15,2) NOT NULL DEFAULT 0 CHECK (purchase_price >= 0),
    supplier_name VARCHAR(255),
    storage_location VARCHAR(255),
    status VARCHAR(30) NOT NULL DEFAULT 'active'
        CHECK (status IN ('active','inactive','damaged','maintenance')),
    image_url TEXT,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(tenant_id, sku)
);

-- quantity_delta sengaja signed:
-- + = masuk, - = keluar/dipakai/rusak.
CREATE TABLE IF NOT EXISTS inventory_stock_movements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    inventory_item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
    movement_type VARCHAR(30) NOT NULL
        CHECK (movement_type IN ('in','out','adjustment','return','damaged')),
    quantity_delta NUMERIC(15,3) NOT NULL CHECK (quantity_delta <> 0),
    reference_type VARCHAR(50),
    reference_id UUID,
    notes TEXT,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION apply_inventory_stock_movement()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    new_stock NUMERIC(15,3);
BEGIN
    UPDATE inventory_items
    SET current_stock = current_stock + NEW.quantity_delta,
        updated_at = NOW()
    WHERE id = NEW.inventory_item_id
      AND tenant_id = NEW.tenant_id
    RETURNING current_stock INTO new_stock;

    IF new_stock IS NULL THEN
        RAISE EXCEPTION 'Inventory item tidak ditemukan atau tenant tidak cocok';
    END IF;

    IF new_stock < 0 THEN
        RAISE EXCEPTION 'Stock tidak boleh menjadi negatif';
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_apply_inventory_stock_movement
AFTER INSERT ON inventory_stock_movements
FOR EACH ROW EXECUTE FUNCTION apply_inventory_stock_movement();

-- =============================================================================
-- 16. CATERING
-- =============================================================================

CREATE TABLE IF NOT EXISTS catering_menus (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    image_url TEXT,
    price_per_pax NUMERIC(15,2) NOT NULL DEFAULT 0 CHECK (price_per_pax >= 0),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS catering_menu_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    menu_id UUID NOT NULL REFERENCES catering_menus(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    course_type VARCHAR(100),
    image_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS catering_recipes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    menu_item_id UUID NOT NULL REFERENCES catering_menu_items(id) ON DELETE CASCADE,
    inventory_item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE RESTRICT,
    quantity_per_pax NUMERIC(15,4) NOT NULL CHECK (quantity_per_pax > 0),
    unit VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(menu_item_id, inventory_item_id)
);

-- =============================================================================
-- 17. PHOTOGRAPHY
-- =============================================================================

CREATE TABLE IF NOT EXISTS photography_equipment (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    inventory_item_id UUID REFERENCES inventory_items(id) ON DELETE SET NULL,
    equipment_type VARCHAR(100) NOT NULL,
    brand VARCHAR(100),
    model VARCHAR(150),
    serial_number VARCHAR(150),
    status VARCHAR(30) NOT NULL DEFAULT 'available'
        CHECK (status IN ('available','reserved','maintenance','damaged')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(tenant_id, serial_number)
);

CREATE TABLE IF NOT EXISTS photography_booking_details (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    booking_id UUID NOT NULL REFERENCES vendor_bookings(id) ON DELETE CASCADE,
    shooting_duration_hours NUMERIC(8,2),
    photographer_count INT NOT NULL DEFAULT 1 CHECK (photographer_count >= 1),
    edited_photo_count INT NOT NULL DEFAULT 0 CHECK (edited_photo_count >= 0),
    album_quantity INT NOT NULL DEFAULT 0 CHECK (album_quantity >= 0),
    delivery_deadline TIMESTAMPTZ,
    shot_list JSONB NOT NULL DEFAULT '[]'::jsonb,
    editing_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(booking_id)
);

-- =============================================================================
-- 18. DEKORASI
-- =============================================================================

CREATE TABLE IF NOT EXISTS decoration_themes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    image_url TEXT,
    style VARCHAR(100),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS decoration_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    inventory_item_id UUID REFERENCES inventory_items(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    item_type VARCHAR(100),
    dimensions VARCHAR(100),
    material VARCHAR(100),
    image_url TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS decoration_theme_items (
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    theme_id UUID NOT NULL REFERENCES decoration_themes(id) ON DELETE CASCADE,
    decoration_item_id UUID NOT NULL REFERENCES decoration_items(id) ON DELETE CASCADE,
    quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
    PRIMARY KEY(theme_id, decoration_item_id)
);

-- =============================================================================
-- 19. MUA
-- =============================================================================

CREATE TABLE IF NOT EXISTS mua_artists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    display_name VARCHAR(255) NOT NULL,
    specialization VARCHAR(150),
    portfolio_urls JSONB NOT NULL DEFAULT '[]'::jsonb,
    notes TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS mua_packages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price NUMERIC(15,2) NOT NULL DEFAULT 0 CHECK (price >= 0),
    duration_hours NUMERIC(8,2),
    included_services JSONB NOT NULL DEFAULT '[]'::jsonb,
    image_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- 20. WEDDING ORGANIZER
-- =============================================================================

CREATE TABLE IF NOT EXISTS wo_rundowns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    booking_id UUID NOT NULL REFERENCES vendor_bookings(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    event_date DATE,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS wo_rundown_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    rundown_id UUID NOT NULL REFERENCES wo_rundowns(id) ON DELETE CASCADE,
    start_time TIMESTAMPTZ,
    end_time TIMESTAMPTZ,
    activity VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    person_in_charge VARCHAR(255),
    notes TEXT,
    display_order INT NOT NULL DEFAULT 0,
    status VARCHAR(30) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending','in_progress','completed','canceled')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (end_time IS NULL OR start_time IS NULL OR end_time >= start_time)
);

-- =============================================================================
-- 21. GENERIC WORKFLOW
-- =============================================================================

CREATE TABLE IF NOT EXISTS vendor_workflows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_category_id UUID NOT NULL REFERENCES vendor_categories(id) ON DELETE CASCADE,
    code VARCHAR(100) NOT NULL,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(vendor_category_id, code)
);

CREATE TABLE IF NOT EXISTS workflow_stages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workflow_id UUID NOT NULL REFERENCES vendor_workflows(id) ON DELETE CASCADE,
    code VARCHAR(100) NOT NULL,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    display_order INT NOT NULL DEFAULT 0,
    is_terminal BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(workflow_id, code)
);

CREATE TABLE IF NOT EXISTS booking_workflow_states (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    booking_id UUID NOT NULL REFERENCES vendor_bookings(id) ON DELETE CASCADE,
    workflow_id UUID NOT NULL REFERENCES vendor_workflows(id) ON DELETE RESTRICT,
    current_stage_id UUID REFERENCES workflow_stages(id) ON DELETE SET NULL,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    UNIQUE(booking_id)
);

CREATE TABLE IF NOT EXISTS booking_workflow_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    booking_id UUID NOT NULL REFERENCES vendor_bookings(id) ON DELETE CASCADE,
    from_stage_id UUID REFERENCES workflow_stages(id) ON DELETE SET NULL,
    to_stage_id UUID REFERENCES workflow_stages(id) ON DELETE SET NULL,
    changed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    notes TEXT,
    changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- 22. INDEXES
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_profiles_tenant_active
    ON profiles(tenant_id, is_active);

CREATE INDEX IF NOT EXISTS idx_clients_tenant_name
    ON clients(tenant_id, full_name);

CREATE INDEX IF NOT EXISTS idx_services_tenant_active
    ON vendor_services(tenant_id, is_active);

CREATE INDEX IF NOT EXISTS idx_bookings_tenant_status
    ON vendor_bookings(tenant_id, status);

CREATE INDEX IF NOT EXISTS idx_bookings_tenant_event_date
    ON vendor_bookings(tenant_id, event_date);

CREATE INDEX IF NOT EXISTS idx_bookings_tenant_client
    ON vendor_bookings(tenant_id, client_id);

CREATE INDEX IF NOT EXISTS idx_transactions_tenant_date
    ON transactions(tenant_id, transaction_date);

CREATE INDEX IF NOT EXISTS idx_invoices_tenant_status_due
    ON invoices(tenant_id, status, due_date);

CREATE INDEX IF NOT EXISTS idx_quotations_tenant_status
    ON quotations(tenant_id, status);

CREATE INDEX IF NOT EXISTS idx_portfolios_tenant_published
    ON portfolios(tenant_id, is_published);

CREATE INDEX IF NOT EXISTS idx_portfolio_media
    ON portfolio_media(tenant_id, portfolio_id, display_order);

CREATE INDEX IF NOT EXISTS idx_inventory_items_tenant_status
    ON inventory_items(tenant_id, status);

CREATE INDEX IF NOT EXISTS idx_inventory_movements_item_date
    ON inventory_stock_movements(tenant_id, inventory_item_id, created_at);

CREATE INDEX IF NOT EXISTS idx_team_assignment_booking
    ON project_team_assignments(tenant_id, booking_id);

CREATE INDEX IF NOT EXISTS idx_workflow_history_booking
    ON booking_workflow_history(tenant_id, booking_id, changed_at);

-- =============================================================================
-- 23. RLS — ENABLE
-- =============================================================================

ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_public_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_category_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_team_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotation_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE catering_menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE catering_menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE catering_recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE photography_equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE photography_booking_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE decoration_themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE decoration_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE decoration_theme_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE mua_artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE mua_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE wo_rundowns ENABLE ROW LEVEL SECURITY;
ALTER TABLE wo_rundown_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_workflow_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_workflow_history ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- 24. RLS — REMOVE OLD V3 POLICIES IF RE-RUN
-- =============================================================================

DO $$
DECLARE
    p RECORD;
BEGIN
    FOR p IN
        SELECT policyname, tablename
        FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename IN (
            'tenants','vendor_profiles','vendor_public_listings','profiles',
            'platform_modules','vendor_category_modules','role_permissions',
            'clients','vendor_services','promo_codes','vendor_bookings',
            'project_team_assignments','quotations','quotation_items',
            'transactions','invoices','contracts','portfolios','portfolio_media',
            'inventory_categories','inventory_items','inventory_stock_movements',
            'catering_menus','catering_menu_items','catering_recipes',
            'photography_equipment','photography_booking_details',
            'decoration_themes','decoration_items','decoration_theme_items',
            'mua_artists','mua_packages','wo_rundowns','wo_rundown_items',
            'vendor_workflows','workflow_stages',
            'booking_workflow_states','booking_workflow_history'
          )
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', p.policyname, p.tablename);
    END LOOP;
END $$;

-- Tenant-private tables.
CREATE POLICY tenant_isolation ON tenants
    FOR ALL USING (id = current_tenant_id())
    WITH CHECK (id = current_tenant_id());

CREATE POLICY tenant_isolation ON vendor_profiles
    FOR ALL USING (tenant_id = current_tenant_id())
    WITH CHECK (tenant_id = current_tenant_id());

CREATE POLICY tenant_isolation ON profiles
    FOR ALL USING (tenant_id = current_tenant_id())
    WITH CHECK (tenant_id = current_tenant_id());

CREATE POLICY tenant_isolation ON clients
    FOR ALL USING (tenant_id = current_tenant_id())
    WITH CHECK (tenant_id = current_tenant_id());

CREATE POLICY tenant_isolation ON vendor_services
    FOR ALL USING (tenant_id = current_tenant_id())
    WITH CHECK (tenant_id = current_tenant_id());

CREATE POLICY tenant_isolation ON promo_codes
    FOR ALL USING (tenant_id = current_tenant_id())
    WITH CHECK (tenant_id = current_tenant_id());

CREATE POLICY tenant_isolation ON vendor_bookings
    FOR ALL USING (tenant_id = current_tenant_id())
    WITH CHECK (tenant_id = current_tenant_id());

CREATE POLICY tenant_isolation ON project_team_assignments
    FOR ALL USING (tenant_id = current_tenant_id())
    WITH CHECK (tenant_id = current_tenant_id());

CREATE POLICY tenant_isolation ON quotations
    FOR ALL USING (tenant_id = current_tenant_id())
    WITH CHECK (tenant_id = current_tenant_id());

CREATE POLICY tenant_isolation ON quotation_items
    FOR ALL USING (tenant_id = current_tenant_id())
    WITH CHECK (tenant_id = current_tenant_id());

CREATE POLICY tenant_isolation ON transactions
    FOR ALL USING (tenant_id = current_tenant_id())
    WITH CHECK (tenant_id = current_tenant_id());

CREATE POLICY tenant_isolation ON invoices
    FOR ALL USING (tenant_id = current_tenant_id())
    WITH CHECK (tenant_id = current_tenant_id());

CREATE POLICY tenant_isolation ON contracts
    FOR ALL USING (tenant_id = current_tenant_id())
    WITH CHECK (tenant_id = current_tenant_id());

CREATE POLICY tenant_isolation ON portfolios
    FOR ALL USING (tenant_id = current_tenant_id())
    WITH CHECK (tenant_id = current_tenant_id());

CREATE POLICY tenant_isolation ON portfolio_media
    FOR ALL USING (tenant_id = current_tenant_id())
    WITH CHECK (tenant_id = current_tenant_id());

CREATE POLICY tenant_isolation ON inventory_categories
    FOR ALL USING (tenant_id = current_tenant_id())
    WITH CHECK (tenant_id = current_tenant_id());

CREATE POLICY tenant_isolation ON inventory_items
    FOR ALL USING (tenant_id = current_tenant_id())
    WITH CHECK (tenant_id = current_tenant_id());

CREATE POLICY tenant_isolation ON inventory_stock_movements
    FOR ALL USING (tenant_id = current_tenant_id())
    WITH CHECK (tenant_id = current_tenant_id());

CREATE POLICY tenant_isolation ON catering_menus
    FOR ALL USING (tenant_id = current_tenant_id())
    WITH CHECK (tenant_id = current_tenant_id());

CREATE POLICY tenant_isolation ON catering_menu_items
    FOR ALL USING (tenant_id = current_tenant_id())
    WITH CHECK (tenant_id = current_tenant_id());

CREATE POLICY tenant_isolation ON catering_recipes
    FOR ALL USING (tenant_id = current_tenant_id())
    WITH CHECK (tenant_id = current_tenant_id());

CREATE POLICY tenant_isolation ON photography_equipment
    FOR ALL USING (tenant_id = current_tenant_id())
    WITH CHECK (tenant_id = current_tenant_id());

CREATE POLICY tenant_isolation ON photography_booking_details
    FOR ALL USING (tenant_id = current_tenant_id())
    WITH CHECK (tenant_id = current_tenant_id());

CREATE POLICY tenant_isolation ON decoration_themes
    FOR ALL USING (tenant_id = current_tenant_id())
    WITH CHECK (tenant_id = current_tenant_id());

CREATE POLICY tenant_isolation ON decoration_items
    FOR ALL USING (tenant_id = current_tenant_id())
    WITH CHECK (tenant_id = current_tenant_id());

CREATE POLICY tenant_isolation ON decoration_theme_items
    FOR ALL USING (tenant_id = current_tenant_id())
    WITH CHECK (tenant_id = current_tenant_id());

CREATE POLICY tenant_isolation ON mua_artists
    FOR ALL USING (tenant_id = current_tenant_id())
    WITH CHECK (tenant_id = current_tenant_id());

CREATE POLICY tenant_isolation ON mua_packages
    FOR ALL USING (tenant_id = current_tenant_id())
    WITH CHECK (tenant_id = current_tenant_id());

CREATE POLICY tenant_isolation ON wo_rundowns
    FOR ALL USING (tenant_id = current_tenant_id())
    WITH CHECK (tenant_id = current_tenant_id());

CREATE POLICY tenant_isolation ON wo_rundown_items
    FOR ALL USING (tenant_id = current_tenant_id())
    WITH CHECK (tenant_id = current_tenant_id());

CREATE POLICY tenant_isolation ON booking_workflow_states
    FOR ALL USING (tenant_id = current_tenant_id())
    WITH CHECK (tenant_id = current_tenant_id());

CREATE POLICY tenant_isolation ON booking_workflow_history
    FOR ALL USING (tenant_id = current_tenant_id())
    WITH CHECK (tenant_id = current_tenant_id());

-- Konfigurasi platform dapat dibaca aplikasi.
CREATE POLICY platform_modules_read ON platform_modules
    FOR SELECT USING (true);

CREATE POLICY vendor_category_modules_read ON vendor_category_modules
    FOR SELECT USING (true);

CREATE POLICY role_permissions_read ON role_permissions
    FOR SELECT USING (true);

-- Workflow hanya dapat dikelola/dibaca tenant yang menggunakan category tersebut.
CREATE POLICY workflow_category_access ON vendor_workflows
    FOR SELECT USING (
        vendor_category_id IN (
            SELECT category_id FROM vendor_profiles WHERE tenant_id = current_tenant_id()
        )
    );

CREATE POLICY workflow_stage_access ON workflow_stages
    FOR SELECT USING (
        workflow_id IN (
            SELECT vw.id
            FROM vendor_workflows vw
            JOIN vendor_profiles vp ON vp.category_id = vw.vendor_category_id
            WHERE vp.tenant_id = current_tenant_id()
        )
    );

-- Marketplace: hanya data yang memang dipublish.
CREATE POLICY public_listing_read ON vendor_public_listings
    FOR SELECT USING (is_published = TRUE);

CREATE POLICY owner_listing_manage ON vendor_public_listings
    FOR ALL USING (tenant_id = current_tenant_id())
    WITH CHECK (tenant_id = current_tenant_id());

-- Portfolio publik: hanya portfolio yang dipublish.
CREATE POLICY public_portfolio_read ON portfolios
    FOR SELECT USING (is_published = TRUE);

-- Media publik hanya mengikuti portfolio yang dapat dilihat publik.
CREATE POLICY public_portfolio_media_read ON portfolio_media
    FOR SELECT USING (
        portfolio_id IN (
            SELECT id FROM portfolios WHERE is_published = TRUE
        )
    );

-- =============================================================================
-- 25. TENANT CONSISTENCY TRIGGERS
-- =============================================================================

DROP TRIGGER IF EXISTS trg_client_tenant_check ON vendor_bookings;
CREATE TRIGGER trg_client_tenant_check
BEFORE INSERT OR UPDATE ON vendor_bookings
FOR EACH ROW EXECUTE FUNCTION enforce_same_tenant('clients','tenant_id','client_id');

DROP TRIGGER IF EXISTS trg_service_tenant_check ON vendor_bookings;
CREATE TRIGGER trg_service_tenant_check
BEFORE INSERT OR UPDATE ON vendor_bookings
FOR EACH ROW EXECUTE FUNCTION enforce_same_tenant('vendor_services','tenant_id','service_id');

DROP TRIGGER IF EXISTS trg_promo_tenant_check ON vendor_bookings;
CREATE TRIGGER trg_promo_tenant_check
BEFORE INSERT OR UPDATE ON vendor_bookings
FOR EACH ROW EXECUTE FUNCTION enforce_same_tenant('promo_codes','tenant_id','promo_code_id');

DROP TRIGGER IF EXISTS trg_booking_profile_tenant_check ON project_team_assignments;
CREATE TRIGGER trg_booking_profile_tenant_check
BEFORE INSERT OR UPDATE ON project_team_assignments
FOR EACH ROW EXECUTE FUNCTION enforce_same_tenant('vendor_bookings','tenant_id','booking_id');

DROP TRIGGER IF EXISTS trg_assignment_profile_tenant_check ON project_team_assignments;
CREATE TRIGGER trg_assignment_profile_tenant_check
BEFORE INSERT OR UPDATE ON project_team_assignments
FOR EACH ROW EXECUTE FUNCTION enforce_same_tenant('profiles','tenant_id','profile_id');

DROP TRIGGER IF EXISTS trg_quotation_client_tenant_check ON quotations;
CREATE TRIGGER trg_quotation_client_tenant_check
BEFORE INSERT OR UPDATE ON quotations
FOR EACH ROW EXECUTE FUNCTION enforce_same_tenant('clients','tenant_id','client_id');

DROP TRIGGER IF EXISTS trg_quotation_booking_tenant_check ON quotations;
CREATE TRIGGER trg_quotation_booking_tenant_check
BEFORE INSERT OR UPDATE ON quotations
FOR EACH ROW EXECUTE FUNCTION enforce_same_tenant('vendor_bookings','tenant_id','booking_id');

DROP TRIGGER IF EXISTS trg_quotation_item_tenant_check ON quotation_items;
CREATE TRIGGER trg_quotation_item_tenant_check
BEFORE INSERT OR UPDATE ON quotation_items
FOR EACH ROW EXECUTE FUNCTION enforce_same_tenant('quotations','tenant_id','quotation_id');

DROP TRIGGER IF EXISTS trg_invoice_booking_tenant_check ON invoices;
CREATE TRIGGER trg_invoice_booking_tenant_check
BEFORE INSERT OR UPDATE ON invoices
FOR EACH ROW EXECUTE FUNCTION enforce_same_tenant('vendor_bookings','tenant_id','booking_id');

DROP TRIGGER IF EXISTS trg_transaction_booking_tenant_check ON transactions;
CREATE TRIGGER trg_transaction_booking_tenant_check
BEFORE INSERT OR UPDATE ON transactions
FOR EACH ROW EXECUTE FUNCTION enforce_same_tenant('vendor_bookings','tenant_id','booking_id');

DROP TRIGGER IF EXISTS trg_transaction_invoice_tenant_check ON transactions;
CREATE TRIGGER trg_transaction_invoice_tenant_check
BEFORE INSERT OR UPDATE ON transactions
FOR EACH ROW EXECUTE FUNCTION enforce_same_tenant('invoices','tenant_id','invoice_id');

DROP TRIGGER IF EXISTS trg_contract_booking_tenant_check ON contracts;
CREATE TRIGGER trg_contract_booking_tenant_check
BEFORE INSERT OR UPDATE ON contracts
FOR EACH ROW EXECUTE FUNCTION enforce_same_tenant('vendor_bookings','tenant_id','booking_id');

DROP TRIGGER IF EXISTS trg_media_portfolio_tenant_check ON portfolio_media;
CREATE TRIGGER trg_media_portfolio_tenant_check
BEFORE INSERT OR UPDATE ON portfolio_media
FOR EACH ROW EXECUTE FUNCTION enforce_same_tenant('portfolios','tenant_id','portfolio_id');

DROP TRIGGER IF EXISTS trg_inventory_category_tenant_check ON inventory_items;
CREATE TRIGGER trg_inventory_category_tenant_check
BEFORE INSERT OR UPDATE ON inventory_items
FOR EACH ROW EXECUTE FUNCTION enforce_same_tenant('inventory_categories','tenant_id','category_id');

DROP TRIGGER IF EXISTS trg_inventory_movement_tenant_check ON inventory_stock_movements;
CREATE TRIGGER trg_inventory_movement_tenant_check
BEFORE INSERT OR UPDATE ON inventory_stock_movements
FOR EACH ROW EXECUTE FUNCTION enforce_same_tenant('inventory_items','tenant_id','inventory_item_id');

DROP TRIGGER IF EXISTS trg_catering_menu_item_tenant_check ON catering_menu_items;
CREATE TRIGGER trg_catering_menu_item_tenant_check
BEFORE INSERT OR UPDATE ON catering_menu_items
FOR EACH ROW EXECUTE FUNCTION enforce_same_tenant('catering_menus','tenant_id','menu_id');

DROP TRIGGER IF EXISTS trg_catering_recipe_menu_tenant_check ON catering_recipes;
CREATE TRIGGER trg_catering_recipe_menu_tenant_check
BEFORE INSERT OR UPDATE ON catering_recipes
FOR EACH ROW EXECUTE FUNCTION enforce_same_tenant('catering_menu_items','tenant_id','menu_item_id');

DROP TRIGGER IF EXISTS trg_catering_recipe_inventory_tenant_check ON catering_recipes;
CREATE TRIGGER trg_catering_recipe_inventory_tenant_check
BEFORE INSERT OR UPDATE ON catering_recipes
FOR EACH ROW EXECUTE FUNCTION enforce_same_tenant('inventory_items','tenant_id','inventory_item_id');

DROP TRIGGER IF EXISTS trg_photo_equipment_inventory_tenant_check ON photography_equipment;
CREATE TRIGGER trg_photo_equipment_inventory_tenant_check
BEFORE INSERT OR UPDATE ON photography_equipment
FOR EACH ROW EXECUTE FUNCTION enforce_same_tenant('inventory_items','tenant_id','inventory_item_id');

DROP TRIGGER IF EXISTS trg_photo_detail_booking_tenant_check ON photography_booking_details;
CREATE TRIGGER trg_photo_detail_booking_tenant_check
BEFORE INSERT OR UPDATE ON photography_booking_details
FOR EACH ROW EXECUTE FUNCTION enforce_same_tenant('vendor_bookings','tenant_id','booking_id');

DROP TRIGGER IF EXISTS trg_decoration_item_inventory_tenant_check ON decoration_items;
CREATE TRIGGER trg_decoration_item_inventory_tenant_check
BEFORE INSERT OR UPDATE ON decoration_items
FOR EACH ROW EXECUTE FUNCTION enforce_same_tenant('inventory_items','tenant_id','inventory_item_id');

DROP TRIGGER IF EXISTS trg_decoration_theme_item_tenant_check ON decoration_theme_items;
CREATE TRIGGER trg_decoration_theme_item_tenant_check
BEFORE INSERT OR UPDATE ON decoration_theme_items
FOR EACH ROW EXECUTE FUNCTION enforce_same_tenant('decoration_themes','tenant_id','theme_id');

DROP TRIGGER IF EXISTS trg_decoration_theme_item_2_tenant_check ON decoration_theme_items;
CREATE TRIGGER trg_decoration_theme_item_2_tenant_check
BEFORE INSERT OR UPDATE ON decoration_theme_items
FOR EACH ROW EXECUTE FUNCTION enforce_same_tenant('decoration_items','tenant_id','decoration_item_id');

DROP TRIGGER IF EXISTS trg_mua_artist_profile_tenant_check ON mua_artists;
CREATE TRIGGER trg_mua_artist_profile_tenant_check
BEFORE INSERT OR UPDATE ON mua_artists
FOR EACH ROW EXECUTE FUNCTION enforce_same_tenant('profiles','tenant_id','profile_id');

DROP TRIGGER IF EXISTS trg_wo_rundown_booking_tenant_check ON wo_rundowns;
CREATE TRIGGER trg_wo_rundown_booking_tenant_check
BEFORE INSERT OR UPDATE ON wo_rundowns
FOR EACH ROW EXECUTE FUNCTION enforce_same_tenant('vendor_bookings','tenant_id','booking_id');

DROP TRIGGER IF EXISTS trg_wo_item_rundown_tenant_check ON wo_rundown_items;
CREATE TRIGGER trg_wo_item_rundown_tenant_check
BEFORE INSERT OR UPDATE ON wo_rundown_items
FOR EACH ROW EXECUTE FUNCTION enforce_same_tenant('wo_rundowns','tenant_id','rundown_id');

DROP TRIGGER IF EXISTS trg_workflow_state_booking_tenant_check ON booking_workflow_states;
CREATE TRIGGER trg_workflow_state_booking_tenant_check
BEFORE INSERT OR UPDATE ON booking_workflow_states
FOR EACH ROW EXECUTE FUNCTION enforce_same_tenant('vendor_bookings','tenant_id','booking_id');

DROP TRIGGER IF EXISTS trg_workflow_history_booking_tenant_check ON booking_workflow_history;
CREATE TRIGGER trg_workflow_history_booking_tenant_check
BEFORE INSERT OR UPDATE ON booking_workflow_history
FOR EACH ROW EXECUTE FUNCTION enforce_same_tenant('vendor_bookings','tenant_id','booking_id');

DROP TRIGGER IF EXISTS trg_workflow_history_profile_tenant_check ON booking_workflow_history;
CREATE TRIGGER trg_workflow_history_profile_tenant_check
BEFORE INSERT OR UPDATE ON booking_workflow_history
FOR EACH ROW EXECUTE FUNCTION enforce_same_tenant('profiles','tenant_id','changed_by');

-- =============================================================================
-- 26. UPDATED_AT TRIGGERS
-- =============================================================================

DO $$
DECLARE
    t TEXT;
BEGIN
    FOREACH t IN ARRAY ARRAY[
        'tenants','vendor_profiles','vendor_public_listings','profiles',
        'clients','vendor_services','quotations','invoices','contracts',
        'portfolios','inventory_items','catering_menus',
        'photography_equipment','photography_booking_details',
        'decoration_themes','mua_packages','wo_rundowns'
    ]
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS trg_updated_at ON %I', t);
        EXECUTE format(
            'CREATE TRIGGER trg_updated_at BEFORE UPDATE ON %I
             FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()',
            t
        );
    END LOOP;
END $$;

-- =============================================================================
-- 27. SEED VENDOR CATEGORIES
-- =============================================================================

INSERT INTO vendor_categories (name, slug, description) VALUES
('Catering', 'catering', 'Vendor makanan, minuman, dan layanan catering acara'),
('Dekorasi', 'dekorasi', 'Vendor dekorasi dan penataan venue acara'),
('MUA', 'mua', 'Makeup Artist dan layanan tata rias'),
('Photography', 'photography', 'Vendor fotografi dan dokumentasi'),
('Wedding Organizer', 'wedding-organizer', 'Vendor perencana dan koordinator acara')
ON CONFLICT (slug) DO NOTHING;

-- =============================================================================
-- 28. SEED MODULES
-- =============================================================================

INSERT INTO platform_modules (code, name, description, is_core) VALUES
('dashboard', 'Dashboard', 'Ringkasan operasional vendor', TRUE),
('clients', 'Clients', 'Pengelolaan klien', TRUE),
('services', 'Services / Packages', 'Layanan dan paket', TRUE),
('quotations', 'Quotations', 'Penawaran dan quotation', TRUE),
('bookings', 'Bookings / Projects', 'Booking dan proyek', TRUE),
('team', 'Team', 'Tim dan assignment', TRUE),
('finance', 'Finance', 'Transaksi dan keuangan', TRUE),
('invoices', 'Invoices', 'Tagihan dan pembayaran', TRUE),
('contracts', 'Contracts', 'Kontrak dan dokumen', TRUE),
('portfolio', 'Portfolio', 'Portofolio dan media', TRUE),
('inventory', 'Inventory', 'Stok dan pergerakan barang', FALSE),
('menu', 'Menu', 'Menu catering', FALSE),
('equipment', 'Equipment', 'Peralatan photography', FALSE),
('decoration', 'Decoration', 'Tema dan properti dekorasi', FALSE),
('mua_artists', 'MUA Artists', 'Data makeup artist', FALSE),
('rundown', 'Rundown', 'Rundown acara WO', FALSE),
('reports', 'Reports', 'Laporan', FALSE),
('settings', 'Settings', 'Pengaturan vendor', TRUE)
ON CONFLICT (code) DO NOTHING;

-- =============================================================================
-- 29. SEED MODULE MAPPING
-- =============================================================================

INSERT INTO vendor_category_modules (vendor_category_id, module_id, display_order)
SELECT vc.id, pm.id, x.display_order
FROM (VALUES
('catering','dashboard',1),('catering','clients',2),('catering','services',3),('catering','quotations',4),
('catering','bookings',5),('catering','menu',5),('catering','inventory',6),
('catering','team',7),('catering','finance',8),('catering','invoices',9),
('catering','contracts',10),('catering','portfolio',11),('catering','reports',12),
('catering','settings',13),

('photography','dashboard',1),('photography','clients',2),('photography','services',3),('photography','quotations',4),
('photography','bookings',5),('photography','equipment',5),('photography','team',6),
('photography','finance',7),('photography','invoices',8),('photography','contracts',9),
('photography','portfolio',10),('photography','reports',11),('photography','settings',12),

('dekorasi','dashboard',1),('dekorasi','clients',2),('dekorasi','services',3),('dekorasi','quotations',4),
('dekorasi','bookings',5),('dekorasi','decoration',5),('dekorasi','inventory',6),
('dekorasi','team',7),('dekorasi','finance',8),('dekorasi','invoices',9),
('dekorasi','contracts',10),('dekorasi','portfolio',11),('dekorasi','reports',12),
('dekorasi','settings',13),

('mua','dashboard',1),('mua','clients',2),('mua','services',3),('mua','quotations',4),
('mua','bookings',5),('mua','mua_artists',5),('mua','inventory',6),
('mua','team',7),('mua','finance',8),('mua','invoices',9),
('mua','contracts',10),('mua','portfolio',11),('mua','reports',12),
('mua','settings',13),

('wedding-organizer','dashboard',1),('wedding-organizer','clients',2),
('wedding-organizer','services',3),('wedding-organizer','quotations',4),('wedding-organizer','bookings',5),
('wedding-organizer','rundown',5),('wedding-organizer','team',6),
('wedding-organizer','finance',7),('wedding-organizer','invoices',8),
('wedding-organizer','contracts',9),('wedding-organizer','portfolio',10),
('wedding-organizer','reports',11),('wedding-organizer','settings',12)
) AS x(category_slug, module_code, display_order)
JOIN vendor_categories vc ON vc.slug = x.category_slug
JOIN platform_modules pm ON pm.code = x.module_code
ON CONFLICT (vendor_category_id, module_id)
DO UPDATE SET display_order = EXCLUDED.display_order, is_enabled = TRUE;

-- =============================================================================
-- 30. SEED DEFAULT ROLE PERMISSIONS
-- =============================================================================

INSERT INTO role_permissions
    (role, module_id, can_view, can_create, can_update, can_delete, can_export)
SELECT
    r.role,
    pm.id,
    TRUE,
    CASE WHEN r.role IN ('owner','admin') THEN TRUE ELSE FALSE END,
    CASE WHEN r.role IN ('owner','admin','staff') THEN TRUE ELSE FALSE END,
    CASE WHEN r.role IN ('owner','admin') THEN TRUE ELSE FALSE END,
    CASE WHEN r.role IN ('owner','admin') THEN TRUE ELSE FALSE END
FROM (
    VALUES
    ('owner'::user_role_enum),
    ('admin'::user_role_enum),
    ('staff'::user_role_enum),
    ('freelancer'::user_role_enum)
) r(role)
CROSS JOIN platform_modules pm
ON CONFLICT (role, module_id) DO NOTHING;

-- =============================================================================
-- 31. SEED WORKFLOWS
-- =============================================================================

INSERT INTO vendor_workflows
    (vendor_category_id, code, name, description, is_default)
SELECT id, 'catering_default', 'Catering Event Workflow',
       'Lead hingga event selesai', TRUE
FROM vendor_categories WHERE slug = 'catering'
ON CONFLICT (vendor_category_id, code) DO NOTHING;

INSERT INTO vendor_workflows
    (vendor_category_id, code, name, description, is_default)
SELECT id, 'photography_default', 'Photography Workflow',
       'Lead hingga delivery hasil foto', TRUE
FROM vendor_categories WHERE slug = 'photography'
ON CONFLICT (vendor_category_id, code) DO NOTHING;

INSERT INTO vendor_workflows
    (vendor_category_id, code, name, description, is_default)
SELECT id, 'dekorasi_default', 'Decoration Workflow',
       'Lead hingga setup dan dismantle', TRUE
FROM vendor_categories WHERE slug = 'dekorasi'
ON CONFLICT (vendor_category_id, code) DO NOTHING;

INSERT INTO vendor_workflows
    (vendor_category_id, code, name, description, is_default)
SELECT id, 'mua_default', 'MUA Workflow',
       'Lead hingga makeup selesai', TRUE
FROM vendor_categories WHERE slug = 'mua'
ON CONFLICT (vendor_category_id, code) DO NOTHING;

INSERT INTO vendor_workflows
    (vendor_category_id, code, name, description, is_default)
SELECT id, 'wo_default', 'Wedding Organizer Workflow',
       'Planning hingga evaluasi event', TRUE
FROM vendor_categories WHERE slug = 'wedding-organizer'
ON CONFLICT (vendor_category_id, code) DO NOTHING;

INSERT INTO workflow_stages
    (workflow_id, code, name, display_order, is_terminal)
SELECT vw.id, x.code, x.name, x.display_order, x.is_terminal
FROM (VALUES
('catering_default','lead','Lead',1,FALSE),
('catering_default','quotation','Quotation',2,FALSE),
('catering_default','booking','Booking',3,FALSE),
('catering_default','dp_paid','DP Paid',4,FALSE),
('catering_default','preparation','Preparation',5,FALSE),
('catering_default','production','Production',6,FALSE),
('catering_default','event','Event',7,FALSE),
('catering_default','completed','Completed',8,TRUE),

('photography_default','lead','Lead',1,FALSE),
('photography_default','quotation','Quotation',2,FALSE),
('photography_default','booking','Booking',3,FALSE),
('photography_default','photoshoot','Photoshoot',4,FALSE),
('photography_default','editing','Editing',5,FALSE),
('photography_default','client_review','Client Review',6,FALSE),
('photography_default','delivery','Delivery',7,FALSE),
('photography_default','completed','Completed',8,TRUE),

('dekorasi_default','lead','Lead',1,FALSE),
('dekorasi_default','survey','Venue Survey',2,FALSE),
('dekorasi_default','quotation','Quotation',3,FALSE),
('dekorasi_default','booking','Booking',4,FALSE),
('dekorasi_default','design','Design',5,FALSE),
('dekorasi_default','preparation','Preparation',6,FALSE),
('dekorasi_default','setup','Setup',7,FALSE),
('dekorasi_default','event','Event',8,FALSE),
('dekorasi_default','dismantle','Dismantle',9,FALSE),
('dekorasi_default','completed','Completed',10,TRUE),

('mua_default','lead','Lead',1,FALSE),
('mua_default','consultation','Consultation',2,FALSE),
('mua_default','booking','Booking',3,FALSE),
('mua_default','preparation','Preparation',4,FALSE),
('mua_default','makeup','Makeup Session',5,FALSE),
('mua_default','completed','Completed',6,TRUE),

('wo_default','lead','Lead',1,FALSE),
('wo_default','meeting','Meeting',2,FALSE),
('wo_default','proposal','Proposal',3,FALSE),
('wo_default','booking','Booking',4,FALSE),
('wo_default','planning','Planning',5,FALSE),
('wo_default','technical_meeting','Technical Meeting',6,FALSE),
('wo_default','event','Event',7,FALSE),
('wo_default','evaluation','Evaluation',8,FALSE),
('wo_default','completed','Completed',9,TRUE)
) AS x(workflow_code, code, name, display_order, is_terminal)
JOIN vendor_workflows vw ON vw.code = x.workflow_code
ON CONFLICT (workflow_id, code) DO UPDATE SET
    name = EXCLUDED.name,
    display_order = EXCLUDED.display_order,
    is_terminal = EXCLUDED.is_terminal;

-- =============================================================================
-- 32. FINAL NOTES
-- =============================================================================
-- Core:
-- tenants, vendor_profiles, profiles, clients, services, bookings,
-- quotations, finance, invoices, contracts, portfolio, team.
--
-- Vendor-specific:
-- Catering     -> menus, menu_items, recipes
-- Photography  -> equipment, shooting details
-- Dekorasi     -> themes, decoration items
-- MUA          -> artists, packages
-- WO           -> rundown, rundown items
--
-- Dynamic:
-- vendor_category_modules -> sidebar/module availability
-- vendor_workflows        -> workflow template
-- workflow_stages         -> stage/status
-- role_permissions        -> role access
--
-- Security:
-- vendor_profiles tidak diberi public SELECT karena mengandung
-- bank_account_info dan data privat. Marketplace menggunakan
-- vendor_public_listings.
--
-- Inventory:
-- stock movement adalah ledger. Jangan UPDATE current_stock langsung
-- dari frontend; buat movement agar audit trail tetap ada.
-- =============================================================================

COMMIT;

-- =============================================================================
-- V3.2 FINAL MATURITY PATCH
-- SUPER ADMIN + SUBSCRIPTION/BILLING + AUDIT + HARDENED RELATIONSHIPS
-- PostgreSQL / Supabase
--
-- IMPORTANT:
-- This file is a COMPLETE V3 baseline with the maturity patch appended.
-- Run this file alone in a fresh database, not V2 + V3 + this file together.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 29. ADDITIONAL ENUMS
-- ---------------------------------------------------------------------------
DO $$ BEGIN
    CREATE TYPE subscription_status_enum AS ENUM
    ('trialing','active','past_due','paused','canceled','expired');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE billing_interval_enum AS ENUM ('monthly','yearly','lifetime');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE subscription_payment_status_enum AS ENUM
    ('pending','paid','failed','refunded','canceled');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE platform_admin_role_enum AS ENUM
    ('super_admin','support_admin','finance_admin','content_admin');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE audit_action_enum AS ENUM
    ('create','update','delete','restore','suspend','activate','login','logout',
     'subscription_change','payment_update','impersonation_start','impersonation_end');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ---------------------------------------------------------------------------
-- 30. SUBSCRIPTION / PLATFORM MASTER
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS subscription_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    billing_interval billing_interval_enum NOT NULL DEFAULT 'monthly',
    price NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (price >= 0),
    max_users INTEGER CHECK (max_users IS NULL OR max_users > 0),
    max_clients INTEGER CHECK (max_clients IS NULL OR max_clients > 0),
    max_bookings_per_month INTEGER CHECK (
        max_bookings_per_month IS NULL OR max_bookings_per_month > 0
    ),
    max_storage_mb INTEGER CHECK (max_storage_mb IS NULL OR max_storage_mb > 0),
    features JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_public BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL UNIQUE REFERENCES tenants(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES subscription_plans(id) ON DELETE RESTRICT,
    status subscription_status_enum NOT NULL DEFAULT 'trialing',
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    trial_ends_at TIMESTAMPTZ,
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    canceled_at TIMESTAMPTZ,
    auto_renew BOOLEAN NOT NULL DEFAULT TRUE,
    external_customer_id TEXT,
    external_subscription_id TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (
        current_period_end IS NULL
        OR current_period_start IS NULL
        OR current_period_end >= current_period_start
    )
);

CREATE TABLE IF NOT EXISTS subscription_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
    plan_id UUID REFERENCES subscription_plans(id) ON DELETE SET NULL,
    amount NUMERIC(14,2) NOT NULL CHECK (amount >= 0),
    currency CHAR(3) NOT NULL DEFAULT 'IDR',
    status subscription_payment_status_enum NOT NULL DEFAULT 'pending',
    paid_at TIMESTAMPTZ,
    due_at TIMESTAMPTZ,
    payment_method TEXT,
    external_payment_id TEXT,
    invoice_reference TEXT,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS subscription_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    old_status subscription_status_enum,
    new_status subscription_status_enum,
    old_plan_id UUID REFERENCES subscription_plans(id) ON DELETE SET NULL,
    new_plan_id UUID REFERENCES subscription_plans(id) ON DELETE SET NULL,
    actor_user_id UUID,
    notes TEXT,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- 31. SUPER ADMIN / PLATFORM ADMIN
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS platform_admins (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role platform_admin_role_enum NOT NULL DEFAULT 'super_admin',
    display_name TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION is_platform_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM platform_admins
        WHERE user_id = auth.uid()
          AND is_active = TRUE
    );
$$;

CREATE OR REPLACE FUNCTION has_platform_role(required_role platform_admin_role_enum)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM platform_admins
        WHERE user_id = auth.uid()
          AND is_active = TRUE
          AND (
              role = 'super_admin'
              OR role = required_role
          )
    );
$$;

-- ---------------------------------------------------------------------------
-- 32. PLATFORM AUDIT LOG
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS platform_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    tenant_id UUID REFERENCES tenants(id) ON DELETE SET NULL,
    action audit_action_enum NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID,
    old_data JSONB,
    new_data JSONB,
    ip_address INET,
    user_agent TEXT,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- 33. VENDOR ADMIN OPERATIONS / SUSPENSION HISTORY
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS vendor_status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    old_status vendor_status_enum,
    new_status vendor_status_enum NOT NULL,
    reason TEXT,
    changed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- 34. PLATFORM SETTINGS
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS platform_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL DEFAULT '{}'::jsonb,
    description TEXT,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- 35. CORE RELATION HARDENING
-- ---------------------------------------------------------------------------
-- Profiles should belong to a real auth user when the row is provisioned.
DO $$ BEGIN
    ALTER TABLE profiles
        ADD CONSTRAINT profiles_id_auth_users_fk
        FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Prevent the same tenant from attaching a subscription payment to another tenant.
CREATE OR REPLACE FUNCTION enforce_subscription_same_tenant()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    parent_tenant UUID;
BEGIN
    SELECT tenant_id INTO parent_tenant
    FROM subscriptions
    WHERE id = NEW.subscription_id;

    IF parent_tenant IS NULL THEN
        RAISE EXCEPTION 'Subscription not found';
    END IF;

    IF NEW.tenant_id IS DISTINCT FROM parent_tenant THEN
        RAISE EXCEPTION 'Cross-tenant subscription reference is not allowed';
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_subscription_payment_tenant_check ON subscription_payments;
CREATE TRIGGER trg_subscription_payment_tenant_check
BEFORE INSERT OR UPDATE ON subscription_payments
FOR EACH ROW EXECUTE FUNCTION enforce_subscription_same_tenant();

DROP TRIGGER IF EXISTS trg_subscription_event_tenant_check ON subscription_events;
CREATE TRIGGER trg_subscription_event_tenant_check
BEFORE INSERT OR UPDATE ON subscription_events
FOR EACH ROW EXECUTE FUNCTION enforce_subscription_same_tenant();

-- Inventory movement must use a signed delta consistent with its movement type.
DO $$ BEGIN
    ALTER TABLE inventory_stock_movements
        ADD CONSTRAINT inventory_movement_sign_check
        CHECK (
            (movement_type IN ('in','return') AND quantity_delta > 0)
            OR
            (movement_type IN ('out','damaged') AND quantity_delta < 0)
            OR
            movement_type = 'adjustment'
        );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ---------------------------------------------------------------------------
-- 36. INDEXES
-- ---------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_subscriptions_plan_status
    ON subscriptions(plan_id, status);

CREATE INDEX IF NOT EXISTS idx_subscription_payments_tenant_status
    ON subscription_payments(tenant_id, status, due_at);

CREATE INDEX IF NOT EXISTS idx_subscription_events_tenant_created
    ON subscription_events(tenant_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_platform_audit_tenant_created
    ON platform_audit_logs(tenant_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_platform_audit_actor_created
    ON platform_audit_logs(actor_user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_vendor_status_history_tenant_created
    ON vendor_status_history(tenant_id, created_at DESC);

-- ---------------------------------------------------------------------------
-- 37. UPDATED_AT
-- ---------------------------------------------------------------------------
DO $$
DECLARE t TEXT;
BEGIN
    FOREACH t IN ARRAY ARRAY[
        'subscription_plans',
        'subscriptions',
        'subscription_payments',
        'platform_admins',
        'platform_settings'
    ]
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS trg_updated_at ON %I', t);
        EXECUTE format(
            'CREATE TRIGGER trg_updated_at BEFORE UPDATE ON %I
             FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()', t
        );
    END LOOP;
END $$;

-- ---------------------------------------------------------------------------
-- 38. RLS — PLATFORM ADMIN OVERRIDE
-- ---------------------------------------------------------------------------
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;

-- Plan catalog: public can see active public plans; platform admins can manage all.
DROP POLICY IF EXISTS subscription_plans_public_read ON subscription_plans;
CREATE POLICY subscription_plans_public_read ON subscription_plans
FOR SELECT USING (is_public = TRUE AND is_active = TRUE);

DROP POLICY IF EXISTS subscription_plans_platform_admin ON subscription_plans;
CREATE POLICY subscription_plans_platform_admin ON subscription_plans
FOR ALL USING (is_platform_admin()) WITH CHECK (is_platform_admin());

DROP POLICY IF EXISTS subscriptions_tenant_access ON subscriptions;
CREATE POLICY subscriptions_tenant_access ON subscriptions
FOR ALL USING (tenant_id = current_tenant_id() OR is_platform_admin())
WITH CHECK (tenant_id = current_tenant_id() OR is_platform_admin());

DROP POLICY IF EXISTS subscription_payments_tenant_access ON subscription_payments;
CREATE POLICY subscription_payments_tenant_access ON subscription_payments
FOR ALL USING (tenant_id = current_tenant_id() OR is_platform_admin())
WITH CHECK (tenant_id = current_tenant_id() OR is_platform_admin());

DROP POLICY IF EXISTS subscription_events_tenant_access ON subscription_events;
CREATE POLICY subscription_events_tenant_access ON subscription_events
FOR SELECT USING (tenant_id = current_tenant_id() OR is_platform_admin());

DROP POLICY IF EXISTS platform_admins_self_read ON platform_admins;
CREATE POLICY platform_admins_self_read ON platform_admins
FOR SELECT USING (user_id = auth.uid() OR is_platform_admin());

DROP POLICY IF EXISTS platform_admins_super_admin_manage ON platform_admins;
CREATE POLICY platform_admins_super_admin_manage ON platform_admins
FOR ALL USING (has_platform_role('super_admin'))
WITH CHECK (has_platform_role('super_admin'));

DROP POLICY IF EXISTS platform_audit_admin_read ON platform_audit_logs;
CREATE POLICY platform_audit_admin_read ON platform_audit_logs
FOR SELECT USING (is_platform_admin());

DROP POLICY IF EXISTS platform_audit_admin_insert ON platform_audit_logs;
CREATE POLICY platform_audit_admin_insert ON platform_audit_logs
FOR INSERT WITH CHECK (
    is_platform_admin()
    OR (
        actor_user_id = auth.uid()
        AND tenant_id = current_tenant_id()
    )
);

DROP POLICY IF EXISTS vendor_status_history_access ON vendor_status_history;
CREATE POLICY vendor_status_history_access ON vendor_status_history
FOR SELECT USING (tenant_id = current_tenant_id() OR is_platform_admin());

DROP POLICY IF EXISTS vendor_status_history_admin_insert ON vendor_status_history;
CREATE POLICY vendor_status_history_admin_insert ON vendor_status_history
FOR INSERT WITH CHECK (is_platform_admin());

DROP POLICY IF EXISTS platform_settings_admin_manage ON platform_settings;
CREATE POLICY platform_settings_admin_manage ON platform_settings
FOR ALL USING (is_platform_admin()) WITH CHECK (is_platform_admin());

-- ---------------------------------------------------------------------------
-- 39. SUPER ADMIN OVERRIDE FOR TENANT-OWNED DATA
-- ---------------------------------------------------------------------------
-- These policies deliberately allow active platform admins to inspect/manage
-- tenant data. Vendor users remain isolated by current_tenant_id().
-- Existing policies are renamed to avoid policy-name collisions.
DO $$
DECLARE
    t TEXT;
BEGIN
    FOREACH t IN ARRAY ARRAY[
        'tenants','vendor_profiles','vendor_public_listings','profiles','clients',
        'vendor_services','promo_codes','vendor_bookings','project_team_assignments',
        'quotations','quotation_items','transactions','invoices','contracts',
        'portfolios','portfolio_media','inventory_categories','inventory_items',
        'inventory_stock_movements','catering_menus','catering_menu_items',
        'catering_recipes','photography_equipment','photography_booking_details',
        'decoration_themes','decoration_items','decoration_theme_items',
        'mua_artists','mua_packages','wo_rundowns','wo_rundown_items',
        'booking_workflow_states','booking_workflow_history'
    ]
    LOOP
        -- Add a generic admin SELECT policy. Existing tenant policies remain.
        EXECUTE format(
            'DROP POLICY IF EXISTS platform_admin_full_access ON %I', t
        );
        EXECUTE format(
            'CREATE POLICY platform_admin_full_access ON %I
             FOR ALL USING (is_platform_admin())
             WITH CHECK (is_platform_admin())', t
        );
    END LOOP;
END $$;

-- Global configuration tables are intentionally readable, but only platform
-- admins may modify them.
DROP POLICY IF EXISTS platform_admin_vendor_categories ON vendor_categories;
CREATE POLICY vendor_categories_public_read ON vendor_categories
FOR SELECT USING (true);

CREATE POLICY platform_admin_vendor_categories ON vendor_categories
FOR ALL USING (is_platform_admin())
WITH CHECK (is_platform_admin());

DROP POLICY IF EXISTS platform_admin_module_config ON platform_modules;
CREATE POLICY platform_admin_module_config ON platform_modules
FOR ALL USING (is_platform_admin())
WITH CHECK (is_platform_admin());

DROP POLICY IF EXISTS platform_admin_category_module_config ON vendor_category_modules;
CREATE POLICY platform_admin_category_module_config ON vendor_category_modules
FOR ALL USING (is_platform_admin())
WITH CHECK (is_platform_admin());

DROP POLICY IF EXISTS platform_admin_role_permissions ON role_permissions;
CREATE POLICY platform_admin_role_permissions ON role_permissions
FOR ALL USING (is_platform_admin())
WITH CHECK (is_platform_admin());

-- Workflow templates are platform configuration in V3.
DROP POLICY IF EXISTS platform_admin_workflow_config ON vendor_workflows;
CREATE POLICY platform_admin_workflow_config ON vendor_workflows
FOR ALL USING (is_platform_admin())
WITH CHECK (is_platform_admin());

DROP POLICY IF EXISTS platform_admin_workflow_stage_config ON workflow_stages;
CREATE POLICY platform_admin_workflow_stage_config ON workflow_stages
FOR ALL USING (is_platform_admin())
WITH CHECK (is_platform_admin());

-- ---------------------------------------------------------------------------
-- 40. DEFAULT SUBSCRIPTION PLANS
-- ---------------------------------------------------------------------------
INSERT INTO subscription_plans
(code, name, description, billing_interval, price, max_users, max_clients,
 max_bookings_per_month, max_storage_mb, features, is_active, is_public, sort_order)
VALUES
(
    'free', 'Free', 'Paket awal untuk vendor baru',
    'monthly', 0, 2, 50, 20, 512,
    '{"modules":["dashboard","clients","services","bookings","finance"]}'::jsonb,
    TRUE, TRUE, 1
),
(
    'pro', 'Pro', 'Paket untuk vendor yang sudah aktif',
    'monthly', 149000, 10, 1000, 200, 5120,
    '{"modules":["all_core","inventory","menu","equipment","decoration","mua_artists","rundown","reports"]}'::jsonb,
    TRUE, TRUE, 2
),
(
    'business', 'Business', 'Paket untuk vendor dengan operasional besar',
    'monthly', 299000, 30, 5000, 1000, 20480,
    '{"modules":["all"],"priority_support":true,"advanced_reports":true}'::jsonb,
    TRUE, TRUE, 3
)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    billing_interval = EXCLUDED.billing_interval,
    price = EXCLUDED.price,
    max_users = EXCLUDED.max_users,
    max_clients = EXCLUDED.max_clients,
    max_bookings_per_month = EXCLUDED.max_bookings_per_month,
    max_storage_mb = EXCLUDED.max_storage_mb,
    features = EXCLUDED.features,
    is_active = EXCLUDED.is_active,
    is_public = EXCLUDED.is_public,
    sort_order = EXCLUDED.sort_order;

COMMIT;

-- =============================================================================
-- END V3.1
-- =============================================================================
