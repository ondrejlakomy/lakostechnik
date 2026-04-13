export type Role = "ADMIN" | "USER_L1" | "USER_L2" | "DRIVER";

export const ROLE_LABELS: Record<Role, string> = {
  ADMIN: "Administrátor",
  USER_L1: "Uživatel L1",
  USER_L2: "Uživatel L2",
  DRIVER: "Řidič",
};

type Permission =
  | "manage_users"
  | "manage_settings"
  | "manage_locations"
  | "manage_warehouses"
  | "manage_customers"
  | "manage_power_plants"
  | "manage_chippers"
  | "manage_drivers"
  | "manage_shifts"
  | "create_transport"
  | "edit_transport"
  | "delete_transport"
  | "view_dashboard"
  | "view_exports"
  | "view_all_transports"
  | "manage_movements"
  | "view_audit_log";

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  ADMIN: [
    "manage_users",
    "manage_settings",
    "manage_locations",
    "manage_warehouses",
    "manage_customers",
    "manage_power_plants",
    "manage_chippers",
    "manage_drivers",
    "manage_shifts",
    "create_transport",
    "edit_transport",
    "delete_transport",
    "view_dashboard",
    "view_exports",
    "view_all_transports",
    "manage_movements",
    "view_audit_log",
  ],
  USER_L1: [
    "manage_locations",
    "manage_warehouses",
    "manage_customers",
    "manage_power_plants",
    "manage_chippers",
    "manage_drivers",
    "manage_shifts",
    "create_transport",
    "edit_transport",
    "view_dashboard",
    "view_exports",
    "view_all_transports",
    "manage_movements",
  ],
  USER_L2: [
    "create_transport",
    "edit_transport",
    "view_dashboard",
    "view_all_transports",
    "manage_movements",
  ],
  DRIVER: ["create_transport", "edit_transport"],
};

export function hasPermission(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function getMenuItems(role: Role) {
  const items = [
    { href: "/dashboard", label: "Dashboard", permission: "view_dashboard" as Permission },
    { href: "/vozidla", label: "Vozidla", permission: "manage_locations" as Permission },
    { href: "/vozidla/dashboard", label: "Dashboard vozidel", permission: "manage_locations" as Permission },
    { href: "/prepravy", label: "Přepravy", permission: "create_transport" as Permission },
    { href: "/pohyby", label: "Pohyby materiálu", permission: "manage_movements" as Permission },
    { href: "/lokace", label: "Lokace", permission: "manage_locations" as Permission },
    { href: "/sklady", label: "Sklady", permission: "manage_warehouses" as Permission },
    { href: "/odberatele", label: "Odběratelé", permission: "manage_customers" as Permission },
    { href: "/elektrarny", label: "Elektrárny", permission: "manage_power_plants" as Permission },
    { href: "/elektrarny/plany", label: "Plány elektráren", permission: "manage_power_plants" as Permission },
    { href: "/stepkovace", label: "Štěpkovače", permission: "manage_chippers" as Permission },
    { href: "/ridici", label: "Řidiči", permission: "manage_drivers" as Permission },
    { href: "/turnusy", label: "Turnusy závozu", permission: "manage_shifts" as Permission },
    { href: "/uzivatele", label: "Uživatelé", permission: "manage_users" as Permission },
    { href: "/exporty", label: "Exporty", permission: "view_exports" as Permission },
    { href: "/nastaveni", label: "Nastavení", permission: "manage_settings" as Permission },
  ];

  return items.filter((item) => hasPermission(role, item.permission));
}
