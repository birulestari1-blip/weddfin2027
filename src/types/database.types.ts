export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type VendorStatusEnum = 'active' | 'suspended' | 'pending_approval';
export type UserRoleEnum = 'owner' | 'admin' | 'staff' | 'freelancer';
export type PricingTypeEnum = 'fixed_package' | 'per_pax' | 'per_hour' | 'custom_quote';
export type BookingStatusEnum = 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'canceled';
export type PaymentStatusEnum = 'unpaid' | 'dp_paid' | 'fully_paid' | 'refunded';
export type TransactionTypeEnum = 'income' | 'expense' | 'payout';
export type SubscriptionStatusEnum = 'trialing' | 'active' | 'past_due' | 'paused' | 'canceled' | 'expired';
export type BillingIntervalEnum = 'monthly' | 'yearly' | 'lifetime';
export type SubscriptionPaymentStatusEnum = 'pending' | 'paid' | 'failed' | 'refunded' | 'canceled';
export type PlatformAdminRoleEnum = 'super_admin' | 'support_admin' | 'finance_admin' | 'content_admin';
export type AuditActionEnum =
  | 'create'
  | 'update'
  | 'delete'
  | 'restore'
  | 'suspend'
  | 'activate'
  | 'login'
  | 'logout'
  | 'subscription_change'
  | 'payment_update'
  | 'impersonation_start'
  | 'impersonation_end';

export interface Database {
  public: {
    Tables: {
      tenants: {
        Row: {
          id: string;
          name: string;
          slug: string;
          logo_url: string | null;
          banner_url: string | null;
          status: VendorStatusEnum;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          logo_url?: string | null;
          banner_url?: string | null;
          status?: VendorStatusEnum;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          logo_url?: string | null;
          banner_url?: string | null;
          status?: VendorStatusEnum;
          created_at?: string;
          updated_at?: string;
        };
      };
      vendor_categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          created_at?: string;
        };
      };
      vendor_profiles: {
        Row: {
          tenant_id: string;
          category_id: string;
          description: string | null;
          city: string;
          address: string | null;
          minimum_price: number;
          gallery_portfolio: Json;
          social_media: Json;
          bank_account_info: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          tenant_id: string;
          category_id: string;
          description?: string | null;
          city: string;
          address?: string | null;
          minimum_price?: number;
          gallery_portfolio?: Json;
          social_media?: Json;
          bank_account_info?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          tenant_id?: string;
          category_id?: string;
          description?: string | null;
          city?: string;
          address?: string | null;
          minimum_price?: number;
          gallery_portfolio?: Json;
          social_media?: Json;
          bank_account_info?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
      vendor_public_listings: {
        Row: {
          tenant_id: string;
          category_id: string;
          display_name: string;
          slug: string;
          description: string | null;
          city: string | null;
          logo_url: string | null;
          banner_url: string | null;
          gallery: Json;
          social_media: Json;
          minimum_price: number;
          is_published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          tenant_id: string;
          category_id: string;
          display_name: string;
          slug: string;
          description?: string | null;
          city?: string | null;
          logo_url?: string | null;
          banner_url?: string | null;
          gallery?: Json;
          social_media?: Json;
          minimum_price?: number;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          tenant_id?: string;
          category_id?: string;
          display_name?: string;
          slug?: string;
          description?: string | null;
          city?: string | null;
          logo_url?: string | null;
          banner_url?: string | null;
          gallery?: Json;
          social_media?: Json;
          minimum_price?: number;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          tenant_id: string;
          full_name: string;
          email: string;
          phone_number: string | null;
          role: UserRoleEnum;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          tenant_id: string;
          full_name: string;
          email: string;
          phone_number?: string | null;
          role?: UserRoleEnum;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          full_name?: string;
          email?: string;
          phone_number?: string | null;
          role?: UserRoleEnum;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      platform_modules: {
        Row: {
          id: string;
          code: string;
          name: string;
          description: string | null;
          is_core: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          name: string;
          description?: string | null;
          is_core?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          code?: string;
          name?: string;
          description?: string | null;
          is_core?: boolean;
          created_at?: string;
        };
      };
      vendor_category_modules: {
        Row: {
          vendor_category_id: string;
          module_id: string;
          is_enabled: boolean;
          display_order: number;
        };
        Insert: {
          vendor_category_id: string;
          module_id: string;
          is_enabled?: boolean;
          display_order?: number;
        };
        Update: {
          vendor_category_id?: string;
          module_id?: string;
          is_enabled?: boolean;
          display_order?: number;
        };
      };
      role_permissions: {
        Row: {
          id: string;
          role: UserRoleEnum;
          module_id: string;
          can_view: boolean;
          can_create: boolean;
          can_update: boolean;
          can_delete: boolean;
          can_export: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          role: UserRoleEnum;
          module_id: string;
          can_view?: boolean;
          can_create?: boolean;
          can_update?: boolean;
          can_delete?: boolean;
          can_export?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          role?: UserRoleEnum;
          module_id?: string;
          can_view?: boolean;
          can_create?: boolean;
          can_update?: boolean;
          can_delete?: boolean;
          can_export?: boolean;
          created_at?: string;
        };
      };
      clients: {
        Row: {
          id: string;
          tenant_id: string;
          full_name: string;
          email: string | null;
          phone_number: string | null;
          company_name: string | null;
          address: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          full_name: string;
          email?: string | null;
          phone_number?: string | null;
          company_name?: string | null;
          address?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          full_name?: string;
          email?: string | null;
          phone_number?: string | null;
          company_name?: string | null;
          address?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      vendor_services: {
        Row: {
          id: string;
          tenant_id: string;
          name: string;
          description: string | null;
          pricing_type: PricingTypeEnum;
          base_price: number;
          min_order_qty: number;
          specifications: Json;
          image_url: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          name: string;
          description?: string | null;
          pricing_type?: PricingTypeEnum;
          base_price?: number;
          min_order_qty?: number;
          specifications?: Json;
          image_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          name?: string;
          description?: string | null;
          pricing_type?: PricingTypeEnum;
          base_price?: number;
          min_order_qty?: number;
          specifications?: Json;
          image_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      promo_codes: {
        Row: {
          id: string;
          tenant_id: string;
          code: string;
          discount_amount: number;
          discount_type: 'fixed' | 'percentage';
          max_uses: number;
          uses_count: number;
          valid_from: string | null;
          valid_until: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          code: string;
          discount_amount?: number;
          discount_type?: 'fixed' | 'percentage';
          max_uses?: number;
          uses_count?: number;
          valid_from?: string | null;
          valid_until?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          code?: string;
          discount_amount?: number;
          discount_type?: 'fixed' | 'percentage';
          max_uses?: number;
          uses_count?: number;
          valid_from?: string | null;
          valid_until?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
      };
      vendor_bookings: {
        Row: {
          id: string;
          tenant_id: string;
          client_id: string | null;
          service_id: string | null;
          promo_code_id: string | null;
          client_name: string;
          client_email: string | null;
          client_phone: string | null;
          portal_access_id: string | null;
          event_name: string | null;
          event_date: string;
          event_end_date: string | null;
          venue_name: string | null;
          venue_address: string | null;
          quantity: number;
          unit_price: number;
          discount_amount: number;
          total_cost: number;
          amount_paid: number;
          booking_details: Json;
          status: BookingStatusEnum;
          payment_status: PaymentStatusEnum;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          client_id?: string | null;
          service_id?: string | null;
          promo_code_id?: string | null;
          client_name: string;
          client_email?: string | null;
          client_phone?: string | null;
          portal_access_id?: string | null;
          event_name?: string | null;
          event_date: string;
          event_end_date?: string | null;
          venue_name?: string | null;
          venue_address?: string | null;
          quantity?: number;
          unit_price?: number;
          discount_amount?: number;
          total_cost?: number;
          amount_paid?: number;
          booking_details?: Json;
          status?: BookingStatusEnum;
          payment_status?: PaymentStatusEnum;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          client_id?: string | null;
          service_id?: string | null;
          promo_code_id?: string | null;
          client_name?: string;
          client_email?: string | null;
          client_phone?: string | null;
          portal_access_id?: string | null;
          event_name?: string | null;
          event_date?: string;
          event_end_date?: string | null;
          venue_name?: string | null;
          venue_address?: string | null;
          quantity?: number;
          unit_price?: number;
          discount_amount?: number;
          total_cost?: number;
          amount_paid?: number;
          booking_details?: Json;
          status?: BookingStatusEnum;
          payment_status?: PaymentStatusEnum;
          created_at?: string;
          updated_at?: string;
        };
      };
      project_team_assignments: {
        Row: {
          id: string;
          tenant_id: string;
          booking_id: string;
          profile_id: string;
          role_in_project: string;
          assigned_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          booking_id: string;
          profile_id: string;
          role_in_project: string;
          assigned_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          booking_id?: string;
          profile_id?: string;
          role_in_project?: string;
          assigned_at?: string;
        };
      };
      quotations: {
        Row: {
          id: string;
          tenant_id: string;
          client_id: string | null;
          booking_id: string | null;
          quotation_number: string;
          title: string;
          subtotal: number;
          discount_amount: number;
          tax_amount: number;
          total_amount: number;
          valid_until: string | null;
          status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired' | 'canceled';
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          client_id?: string | null;
          booking_id?: string | null;
          quotation_number: string;
          title: string;
          subtotal?: number;
          discount_amount?: number;
          tax_amount?: number;
          total_amount?: number;
          valid_until?: string | null;
          status?: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired' | 'canceled';
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          client_id?: string | null;
          booking_id?: string | null;
          quotation_number?: string;
          title?: string;
          subtotal?: number;
          discount_amount?: number;
          tax_amount?: number;
          total_amount?: number;
          valid_until?: string | null;
          status?: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired' | 'canceled';
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      quotation_items: {
        Row: {
          id: string;
          tenant_id: string;
          quotation_id: string;
          service_id: string | null;
          item_name: string;
          description: string | null;
          quantity: number;
          unit_price: number;
          discount_amount: number;
          line_total: number;
          display_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          quotation_id: string;
          service_id?: string | null;
          item_name: string;
          description?: string | null;
          quantity?: number;
          unit_price?: number;
          discount_amount?: number;
          line_total?: number;
          display_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          quotation_id?: string;
          service_id?: string | null;
          item_name?: string;
          description?: string | null;
          quantity?: number;
          unit_price?: number;
          discount_amount?: number;
          line_total?: number;
          display_order?: number;
          created_at?: string;
        };
      };
      transactions: {
        Row: {
          id: string;
          tenant_id: string;
          booking_id: string | null;
          invoice_id: string | null;
          transaction_date: string;
          type: TransactionTypeEnum;
          amount: number;
          description: string;
          payment_method: string | null;
          reference_id: string | null;
          proof_of_payment_url: string | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          booking_id?: string | null;
          invoice_id?: string | null;
          transaction_date?: string;
          type: TransactionTypeEnum;
          amount: number;
          description: string;
          payment_method?: string | null;
          reference_id?: string | null;
          proof_of_payment_url?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          booking_id?: string | null;
          invoice_id?: string | null;
          transaction_date?: string;
          type?: TransactionTypeEnum;
          amount?: number;
          description?: string;
          payment_method?: string | null;
          reference_id?: string | null;
          proof_of_payment_url?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
      };
      invoices: {
        Row: {
          id: string;
          tenant_id: string;
          booking_id: string;
          invoice_number: string;
          payment_stage: 'down_payment' | 'installment' | 'final_payment';
          amount: number;
          due_date: string;
          status: 'unpaid' | 'paid' | 'overdue' | 'canceled';
          paid_at: string | null;
          payment_link: string | null;
          payment_reference_id: string | null;
          payment_method: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          booking_id: string;
          invoice_number: string;
          payment_stage: 'down_payment' | 'installment' | 'final_payment';
          amount: number;
          due_date: string;
          status?: 'unpaid' | 'paid' | 'overdue' | 'canceled';
          paid_at?: string | null;
          payment_link?: string | null;
          payment_reference_id?: string | null;
          payment_method?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          booking_id?: string;
          invoice_number?: string;
          payment_stage?: 'down_payment' | 'installment' | 'final_payment';
          amount?: number;
          due_date?: string;
          status?: 'unpaid' | 'paid' | 'overdue' | 'canceled';
          paid_at?: string | null;
          payment_link?: string | null;
          payment_reference_id?: string | null;
          payment_method?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      contracts: {
        Row: {
          id: string;
          tenant_id: string;
          booking_id: string;
          contract_number: string;
          terms_and_conditions: string;
          scope_of_work: Json;
          status: 'draft' | 'sent' | 'signed' | 'rejected' | 'void';
          client_signed_at: string | null;
          vendor_signed_at: string | null;
          client_signature_url: string | null;
          vendor_signature_url: string | null;
          pdf_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          booking_id: string;
          contract_number: string;
          terms_and_conditions: string;
          scope_of_work?: Json;
          status?: 'draft' | 'sent' | 'signed' | 'rejected' | 'void';
          client_signed_at?: string | null;
          vendor_signed_at?: string | null;
          client_signature_url?: string | null;
          vendor_signature_url?: string | null;
          pdf_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          booking_id?: string;
          contract_number?: string;
          terms_and_conditions?: string;
          scope_of_work?: Json;
          status?: 'draft' | 'sent' | 'signed' | 'rejected' | 'void';
          client_signed_at?: string | null;
          vendor_signed_at?: string | null;
          client_signature_url?: string | null;
          vendor_signature_url?: string | null;
          pdf_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      portfolios: {
        Row: {
          id: string;
          tenant_id: string;
          title: string;
          slug: string;
          description: string | null;
          event_date: string | null;
          venue_name: string | null;
          is_featured: boolean;
          is_published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          title: string;
          slug: string;
          description?: string | null;
          event_date?: string | null;
          venue_name?: string | null;
          is_featured?: boolean;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          title?: string;
          slug?: string;
          description?: string | null;
          event_date?: string | null;
          venue_name?: string | null;
          is_featured?: boolean;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      portfolio_media: {
        Row: {
          id: string;
          tenant_id: string;
          portfolio_id: string;
          media_type: 'image' | 'video';
          media_url: string;
          thumbnail_url: string | null;
          caption: string | null;
          display_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          portfolio_id: string;
          media_type: 'image' | 'video';
          media_url: string;
          thumbnail_url?: string | null;
          caption?: string | null;
          display_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          portfolio_id?: string;
          media_type?: 'image' | 'video';
          media_url?: string;
          thumbnail_url?: string | null;
          caption?: string | null;
          display_order?: number;
          created_at?: string;
        };
      };
      inventory_categories: {
        Row: {
          id: string;
          tenant_id: string;
          name: string;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          name: string;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          name?: string;
          description?: string | null;
          created_at?: string;
        };
      };
      inventory_items: {
        Row: {
          id: string;
          tenant_id: string;
          category_id: string | null;
          sku: string | null;
          name: string;
          description: string | null;
          unit: string;
          current_stock: number;
          minimum_stock: number;
          purchase_price: number;
          supplier_name: string | null;
          storage_location: string | null;
          status: 'active' | 'inactive' | 'damaged' | 'maintenance';
          image_url: string | null;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          category_id?: string | null;
          sku?: string | null;
          name: string;
          description?: string | null;
          unit?: string;
          current_stock?: number;
          minimum_stock?: number;
          purchase_price?: number;
          supplier_name?: string | null;
          storage_location?: string | null;
          status?: 'active' | 'inactive' | 'damaged' | 'maintenance';
          image_url?: string | null;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          category_id?: string | null;
          sku?: string | null;
          name?: string;
          description?: string | null;
          unit?: string;
          current_stock?: number;
          minimum_stock?: number;
          purchase_price?: number;
          supplier_name?: string | null;
          storage_location?: string | null;
          status?: 'active' | 'inactive' | 'damaged' | 'maintenance';
          image_url?: string | null;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
      inventory_stock_movements: {
        Row: {
          id: string;
          tenant_id: string;
          inventory_item_id: string;
          movement_type: 'in' | 'out' | 'adjustment' | 'return' | 'damaged';
          quantity_delta: number;
          reference_type: string | null;
          reference_id: string | null;
          notes: string | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          inventory_item_id: string;
          movement_type: 'in' | 'out' | 'adjustment' | 'return' | 'damaged';
          quantity_delta: number;
          reference_type?: string | null;
          reference_id?: string | null;
          notes?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          inventory_item_id?: string;
          movement_type?: 'in' | 'out' | 'adjustment' | 'return' | 'damaged';
          quantity_delta?: number;
          reference_type?: string | null;
          reference_id?: string | null;
          notes?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
      };
      catering_menus: {
        Row: {
          id: string;
          tenant_id: string;
          name: string;
          description: string | null;
          category: string | null;
          image_url: string | null;
          price_per_pax: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          name: string;
          description?: string | null;
          category?: string | null;
          image_url?: string | null;
          price_per_pax?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          name?: string;
          description?: string | null;
          category?: string | null;
          image_url?: string | null;
          price_per_pax?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      catering_menu_items: {
        Row: {
          id: string;
          tenant_id: string;
          menu_id: string;
          name: string;
          description: string | null;
          course_type: string | null;
          image_url: string | null;
          is_active: boolean;
          display_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          menu_id: string;
          name: string;
          description?: string | null;
          course_type?: string | null;
          image_url?: string | null;
          is_active?: boolean;
          display_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          menu_id?: string;
          name?: string;
          description?: string | null;
          course_type?: string | null;
          image_url?: string | null;
          is_active?: boolean;
          display_order?: number;
          created_at?: string;
        };
      };
      catering_recipes: {
        Row: {
          id: string;
          tenant_id: string;
          menu_item_id: string;
          inventory_item_id: string;
          quantity_per_pax: number;
          unit: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          menu_item_id: string;
          inventory_item_id: string;
          quantity_per_pax: number;
          unit: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          menu_item_id?: string;
          inventory_item_id?: string;
          quantity_per_pax?: number;
          unit?: string;
          created_at?: string;
        };
      };
      photography_equipment: {
        Row: {
          id: string;
          tenant_id: string;
          inventory_item_id: string | null;
          equipment_type: string;
          brand: string | null;
          model: string | null;
          serial_number: string | null;
          status: 'available' | 'reserved' | 'maintenance' | 'damaged';
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          inventory_item_id?: string | null;
          equipment_type: string;
          brand?: string | null;
          model?: string | null;
          serial_number?: string | null;
          status?: 'available' | 'reserved' | 'maintenance' | 'damaged';
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          inventory_item_id?: string | null;
          equipment_type?: string;
          brand?: string | null;
          model?: string | null;
          serial_number?: string | null;
          status?: 'available' | 'reserved' | 'maintenance' | 'damaged';
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      photography_booking_details: {
        Row: {
          id: string;
          tenant_id: string;
          booking_id: string;
          shooting_duration_hours: number | null;
          photographer_count: number;
          edited_photo_count: number;
          album_quantity: number;
          delivery_deadline: string | null;
          shot_list: Json;
          editing_notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          booking_id: string;
          shooting_duration_hours?: number | null;
          photographer_count?: number;
          edited_photo_count?: number;
          album_quantity?: number;
          delivery_deadline?: string | null;
          shot_list?: Json;
          editing_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          booking_id?: string;
          shooting_duration_hours?: number | null;
          photographer_count?: number;
          edited_photo_count?: number;
          album_quantity?: number;
          delivery_deadline?: string | null;
          shot_list?: Json;
          editing_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      decoration_themes: {
        Row: {
          id: string;
          tenant_id: string;
          name: string;
          description: string | null;
          image_url: string | null;
          style: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          name: string;
          description?: string | null;
          image_url?: string | null;
          style?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          name?: string;
          description?: string | null;
          image_url?: string | null;
          style?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      decoration_items: {
        Row: {
          id: string;
          tenant_id: string;
          inventory_item_id: string | null;
          name: string;
          item_type: string | null;
          dimensions: string | null;
          material: string | null;
          image_url: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          inventory_item_id?: string | null;
          name: string;
          item_type?: string | null;
          dimensions?: string | null;
          material?: string | null;
          image_url?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          inventory_item_id?: string | null;
          name?: string;
          item_type?: string | null;
          dimensions?: string | null;
          material?: string | null;
          image_url?: string | null;
          notes?: string | null;
          created_at?: string;
        };
      };
      decoration_theme_items: {
        Row: {
          tenant_id: string;
          theme_id: string;
          decoration_item_id: string;
          quantity: number;
        };
        Insert: {
          tenant_id: string;
          theme_id: string;
          decoration_item_id: string;
          quantity?: number;
        };
        Update: {
          tenant_id?: string;
          theme_id?: string;
          decoration_item_id?: string;
          quantity?: number;
        };
      };
      mua_artists: {
        Row: {
          id: string;
          tenant_id: string;
          profile_id: string | null;
          display_name: string;
          specialization: string | null;
          portfolio_urls: Json;
          notes: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          profile_id?: string | null;
          display_name: string;
          specialization?: string | null;
          portfolio_urls?: Json;
          notes?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          profile_id?: string | null;
          display_name?: string;
          specialization?: string | null;
          portfolio_urls?: Json;
          notes?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
      };
      mua_packages: {
        Row: {
          id: string;
          tenant_id: string;
          name: string;
          description: string | null;
          price: number;
          duration_hours: number | null;
          included_services: Json;
          image_url: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          name: string;
          description?: string | null;
          price?: number;
          duration_hours?: number | null;
          included_services?: Json;
          image_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          name?: string;
          description?: string | null;
          price?: number;
          duration_hours?: number | null;
          included_services?: Json;
          image_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      wo_rundowns: {
        Row: {
          id: string;
          tenant_id: string;
          booking_id: string;
          title: string;
          event_date: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          booking_id: string;
          title: string;
          event_date?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          booking_id?: string;
          title?: string;
          event_date?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      wo_rundown_items: {
        Row: {
          id: string;
          tenant_id: string;
          rundown_id: string;
          start_time: string | null;
          end_time: string | null;
          activity: string;
          location: string | null;
          person_in_charge: string | null;
          notes: string | null;
          display_order: number;
          status: 'pending' | 'in_progress' | 'completed' | 'canceled';
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          rundown_id: string;
          start_time?: string | null;
          end_time?: string | null;
          activity: string;
          location?: string | null;
          person_in_charge?: string | null;
          notes?: string | null;
          display_order?: number;
          status?: 'pending' | 'in_progress' | 'completed' | 'canceled';
          created_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          rundown_id?: string;
          start_time?: string | null;
          end_time?: string | null;
          activity?: string;
          location?: string | null;
          person_in_charge?: string | null;
          notes?: string | null;
          display_order?: number;
          status?: 'pending' | 'in_progress' | 'completed' | 'canceled';
          created_at?: string;
        };
      };
      vendor_workflows: {
        Row: {
          id: string;
          vendor_category_id: string;
          code: string;
          name: string;
          description: string | null;
          is_default: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          vendor_category_id: string;
          code: string;
          name: string;
          description?: string | null;
          is_default?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          vendor_category_id?: string;
          code?: string;
          name?: string;
          description?: string | null;
          is_default?: boolean;
          created_at?: string;
        };
      };
      workflow_stages: {
        Row: {
          id: string;
          workflow_id: string;
          code: string;
          name: string;
          description: string | null;
          display_order: number;
          is_terminal: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          workflow_id: string;
          code: string;
          name: string;
          description?: string | null;
          display_order?: number;
          is_terminal?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          workflow_id?: string;
          code?: string;
          name?: string;
          description?: string | null;
          display_order?: number;
          is_terminal?: boolean;
          created_at?: string;
        };
      };
      booking_workflow_states: {
        Row: {
          id: string;
          tenant_id: string;
          booking_id: string;
          workflow_id: string;
          current_stage_id: string | null;
          started_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          booking_id: string;
          workflow_id: string;
          current_stage_id?: string | null;
          started_at?: string;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          booking_id?: string;
          workflow_id?: string;
          current_stage_id?: string | null;
          started_at?: string;
          completed_at?: string | null;
        };
      };
      booking_workflow_history: {
        Row: {
          id: string;
          tenant_id: string;
          booking_id: string;
          from_stage_id: string | null;
          to_stage_id: string | null;
          changed_by: string | null;
          notes: string | null;
          changed_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          booking_id: string;
          from_stage_id?: string | null;
          to_stage_id?: string | null;
          changed_by?: string | null;
          notes?: string | null;
          changed_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          booking_id?: string;
          from_stage_id?: string | null;
          to_stage_id?: string | null;
          changed_by?: string | null;
          notes?: string | null;
          changed_at?: string;
        };
      };
      subscription_plans: {
        Row: {
          id: string;
          code: string;
          name: string;
          description: string | null;
          billing_interval: BillingIntervalEnum;
          price: number;
          max_users: number | null;
          max_clients: number | null;
          max_bookings_per_month: number | null;
          max_storage_mb: number | null;
          features: Json;
          is_active: boolean;
          is_public: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          name: string;
          description?: string | null;
          billing_interval?: BillingIntervalEnum;
          price?: number;
          max_users?: number | null;
          max_clients?: number | null;
          max_bookings_per_month?: number | null;
          max_storage_mb?: number | null;
          features?: Json;
          is_active?: boolean;
          is_public?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          code?: string;
          name?: string;
          description?: string | null;
          billing_interval?: BillingIntervalEnum;
          price?: number;
          max_users?: number | null;
          max_clients?: number | null;
          max_bookings_per_month?: number | null;
          max_storage_mb?: number | null;
          features?: Json;
          is_active?: boolean;
          is_public?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      subscriptions: {
        Row: {
          id: string;
          tenant_id: string;
          plan_id: string;
          status: SubscriptionStatusEnum;
          started_at: string;
          trial_ends_at: string | null;
          current_period_start: string | null;
          current_period_end: string | null;
          canceled_at: string | null;
          auto_renew: boolean;
          external_customer_id: string | null;
          external_subscription_id: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          plan_id: string;
          status?: SubscriptionStatusEnum;
          started_at?: string;
          trial_ends_at?: string | null;
          current_period_start?: string | null;
          current_period_end?: string | null;
          canceled_at?: string | null;
          auto_renew?: boolean;
          external_customer_id?: string | null;
          external_subscription_id?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          plan_id?: string;
          status?: SubscriptionStatusEnum;
          started_at?: string;
          trial_ends_at?: string | null;
          current_period_start?: string | null;
          current_period_end?: string | null;
          canceled_at?: string | null;
          auto_renew?: boolean;
          external_customer_id?: string | null;
          external_subscription_id?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      subscription_payments: {
        Row: {
          id: string;
          tenant_id: string;
          subscription_id: string;
          plan_id: string | null;
          amount: number;
          currency: string;
          status: SubscriptionPaymentStatusEnum;
          paid_at: string | null;
          due_at: string | null;
          payment_method: string | null;
          external_payment_id: string | null;
          invoice_reference: string | null;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          subscription_id: string;
          plan_id?: string | null;
          amount: number;
          currency?: string;
          status?: SubscriptionPaymentStatusEnum;
          paid_at?: string | null;
          due_at?: string | null;
          payment_method?: string | null;
          external_payment_id?: string | null;
          invoice_reference?: string | null;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          subscription_id?: string;
          plan_id?: string | null;
          amount?: number;
          currency?: string;
          status?: SubscriptionPaymentStatusEnum;
          paid_at?: string | null;
          due_at?: string | null;
          payment_method?: string | null;
          external_payment_id?: string | null;
          invoice_reference?: string | null;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
      subscription_events: {
        Row: {
          id: string;
          tenant_id: string;
          subscription_id: string;
          event_type: string;
          old_status: SubscriptionStatusEnum | null;
          new_status: SubscriptionStatusEnum | null;
          old_plan_id: string | null;
          new_plan_id: string | null;
          actor_user_id: string | null;
          notes: string | null;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          subscription_id: string;
          event_type: string;
          old_status?: SubscriptionStatusEnum | null;
          new_status?: SubscriptionStatusEnum | null;
          old_plan_id?: string | null;
          new_plan_id?: string | null;
          actor_user_id?: string | null;
          notes?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          subscription_id?: string;
          event_type?: string;
          old_status?: SubscriptionStatusEnum | null;
          new_status?: SubscriptionStatusEnum | null;
          old_plan_id?: string | null;
          new_plan_id?: string | null;
          actor_user_id?: string | null;
          notes?: string | null;
          metadata?: Json;
          created_at?: string;
        };
      };
      platform_admins: {
        Row: {
          user_id: string;
          role: PlatformAdminRoleEnum;
          display_name: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          role?: PlatformAdminRoleEnum;
          display_name?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          role?: PlatformAdminRoleEnum;
          display_name?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      platform_audit_logs: {
        Row: {
          id: string;
          actor_user_id: string | null;
          tenant_id: string | null;
          action: AuditActionEnum;
          entity_type: string;
          entity_id: string | null;
          old_data: Json | null;
          new_data: Json | null;
          ip_address: string | null;
          user_agent: string | null;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          actor_user_id?: string | null;
          tenant_id?: string | null;
          action: AuditActionEnum;
          entity_type: string;
          entity_id?: string | null;
          old_data?: Json | null;
          new_data?: Json | null;
          ip_address?: string | null;
          user_agent?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          actor_user_id?: string | null;
          tenant_id?: string | null;
          action?: AuditActionEnum;
          entity_type?: string;
          entity_id?: string | null;
          old_data?: Json | null;
          new_data?: Json | null;
          ip_address?: string | null;
          user_agent?: string | null;
          metadata?: Json;
          created_at?: string;
        };
      };
      vendor_status_history: {
        Row: {
          id: string;
          tenant_id: string;
          old_status: VendorStatusEnum | null;
          new_status: VendorStatusEnum;
          reason: string | null;
          changed_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          old_status?: VendorStatusEnum | null;
          new_status: VendorStatusEnum;
          reason?: string | null;
          changed_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          old_status?: VendorStatusEnum | null;
          new_status?: VendorStatusEnum;
          reason?: string | null;
          changed_by?: string | null;
          created_at?: string;
        };
      };
      platform_settings: {
        Row: {
          key: string;
          value: Json;
          description: string | null;
          updated_by: string | null;
          updated_at: string;
        };
        Insert: {
          key: string;
          value?: Json;
          description?: string | null;
          updated_by?: string | null;
          updated_at?: string;
        };
        Update: {
          key?: string;
          value?: Json;
          description?: string | null;
          updated_by?: string | null;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      current_tenant_id: {
        Args: Record<PropertyKey, never>;
        Returns: string | null;
      };
      is_platform_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      has_platform_role: {
        Args: {
          required_role: PlatformAdminRoleEnum;
        };
        Returns: boolean;
      };
    };
    Enums: {
      vendor_status_enum: VendorStatusEnum;
      user_role_enum: UserRoleEnum;
      pricing_type_enum: PricingTypeEnum;
      booking_status_enum: BookingStatusEnum;
      payment_status_enum: PaymentStatusEnum;
      transaction_type_enum: TransactionTypeEnum;
      subscription_status_enum: SubscriptionStatusEnum;
      billing_interval_enum: BillingIntervalEnum;
      subscription_payment_status_enum: SubscriptionPaymentStatusEnum;
      platform_admin_role_enum: PlatformAdminRoleEnum;
      audit_action_enum: AuditActionEnum;
    };
  };
}

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];
export type TablesInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];
export type TablesUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];
