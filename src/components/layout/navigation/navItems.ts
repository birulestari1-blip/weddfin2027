// Navigation item definitions for the V3.2 sidebar.
// Items are filtered at render time based on user role / tenant modules.
// Do NOT add business logic here — this is UI structure only.

export interface NavItem {
  id: string;
  title: string;
  path?: string;
  icon: string; // Material icon name
  children?: NavItem[];
  /** Roles that can see this item. Empty = all authenticated users. */
  roles?: string[];
  /** Module key for platform module gating (future use). */
  module?: string;
  dividerBefore?: boolean;
}

export interface NavGroup {
  id: string;
  title: string;
  items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    id: 'core',
    title: 'Overview',
    items: [
      {
        id: 'dashboard',
        title: 'Dashboard',
        path: '/dashboard',
        icon: 'Dashboard',
      },
    ],
  },
  {
    id: 'crm',
    title: 'CRM & Sales',
    items: [
      {
        id: 'clients',
        title: 'Clients',
        path: '/clients',
        icon: 'People',
      },
      {
        id: 'services',
        title: 'Services & Packages',
        path: '/services',
        icon: 'Inventory2',
      },
      {
        id: 'quotations',
        title: 'Quotations',
        path: '/quotations',
        icon: 'RequestQuote',
      },
      {
        id: 'bookings',
        title: 'Bookings & Projects',
        path: '/bookings',
        icon: 'EventNote',
      },
    ],
  },
  {
    id: 'finance',
    title: 'Finance',
    items: [
      {
        id: 'finance',
        title: 'Transactions',
        path: '/finance',
        icon: 'AccountBalance',
      },
      {
        id: 'invoices',
        title: 'Invoices',
        path: '/invoices',
        icon: 'Receipt',
      },
      {
        id: 'contracts',
        title: 'Contracts',
        path: '/contracts',
        icon: 'Description',
      },
    ],
  },
  {
    id: 'operations',
    title: 'Operations',
    items: [
      {
        id: 'portfolio',
        title: 'Portfolio',
        path: '/portfolio',
        icon: 'PhotoLibrary',
      },
      {
        id: 'inventory',
        title: 'Inventory',
        path: '/inventory',
        icon: 'Warehouse',
        module: 'inventory',
      },
      {
        id: 'workflows',
        title: 'Workflows',
        path: '/workflows',
        icon: 'AccountTree',
      },
    ],
  },
  {
    id: 'vendor-specific',
    title: 'Vendor Modules',
    items: [
      {
        id: 'catering-overview',
        title: 'Catering Overview',
        path: '/catering/overview',
        icon: 'Dashboard',
        module: 'catering',
      },
      {
        id: 'catering-menus',
        title: 'Catering Menus',
        path: '/catering/menus',
        icon: 'RestaurantMenu',
        module: 'catering',
      },
      {
        id: 'photography-overview',
        title: 'Photography Overview',
        path: '/photography/overview',
        icon: 'PhotoCamera',
        module: 'photography',
      },
      {
        id: 'photography-equipment',
        title: 'Photography Equipment',
        path: '/photography/equipment',
        icon: 'CameraAlt',
        module: 'photography',
      },
      {
        id: 'dekorasi-themes',
        title: 'Decoration Themes',
        path: '/dekorasi/themes',
        icon: 'AutoAwesome',
        module: 'dekorasi',
      },
      {
        id: 'mua-artists',
        title: 'MUA Artists',
        path: '/mua/artists',
        icon: 'Face4',
        module: 'mua',
      },
      {
        id: 'wo-rundowns',
        title: 'WO Rundowns',
        path: '/wedding-organizer/rundowns',
        icon: 'FormatListNumbered',
        module: 'wedding_organizer',
      },
    ],
  },
  {
    id: 'admin',
    title: 'Super Admin',
    items: [
      {
        id: 'super-admin',
        title: 'Admin Portal',
        path: '/super-admin',
        icon: 'AdminPanelSettings',
        roles: ['super_admin'],
      },
    ],
  },
];
