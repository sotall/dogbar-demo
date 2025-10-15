// Canonical actions registry for RBAC UI and checks
// key: machine key used in role_permissions.action_key
// label: human-readable
// section: grouping for UI

export const ACTIONS = [
  // Users
  { key: "users.view", label: "View users", section: "Users" },
  { key: "users.create", label: "Create users", section: "Users" },
  { key: "users.edit", label: "Edit users", section: "Users" },
  { key: "users.delete", label: "Delete users", section: "Users" },
  { key: "users.invite", label: "Invite users (email link)", section: "Users" },
  { key: "users.reset_password", label: "Reset passwords", section: "Users" },

  // Events
  { key: "events.view", label: "View events", section: "Events" },
  { key: "events.create", label: "Create events", section: "Events" },
  { key: "events.edit", label: "Edit events", section: "Events" },
  { key: "events.delete", label: "Delete events", section: "Events" },
  { key: "events.publish", label: "Publish events", section: "Events" },

  // Media
  { key: "media.view", label: "View media library", section: "Media" },
  { key: "media.upload", label: "Upload media", section: "Media" },
  { key: "media.delete", label: "Delete media", section: "Media" },

  // Site Settings
  {
    key: "site_settings.view",
    label: "View site settings",
    section: "Site Settings",
  },
  {
    key: "site_settings.edit",
    label: "Edit site settings",
    section: "Site Settings",
  },

  // Logs / Schema / Dashboard
  { key: "logs.view", label: "View audit logs", section: "Platform" },
  { key: "schema.view", label: "View schema inspector", section: "Platform" },
  { key: "dashboard.view", label: "View dashboard", section: "Platform" },

  // Food Trucks
  {
    key: "food_trucks.view",
    label: "View food trucks",
    section: "Food Trucks",
  },
  {
    key: "food_trucks.create",
    label: "Create food trucks",
    section: "Food Trucks",
  },
  {
    key: "food_trucks.edit",
    label: "Edit food trucks",
    section: "Food Trucks",
  },
  {
    key: "food_trucks.delete",
    label: "Delete food trucks",
    section: "Food Trucks",
  },
];

export const ROLES = ["super_admin", "admin", "manager", "staff", "viewer"];

export function roleRank(role) {
  switch ((role || "").toLowerCase()) {
    case "super_admin":
      return 5;
    case "admin":
      return 4;
    case "manager":
      return 3;
    case "staff":
      return 2;
    case "viewer":
      return 1;
    default:
      return 0;
  }
}

export function summarizeRoleCapabilities(role, matrix) {
  const allowed = ACTIONS.filter(
    (a) => matrix[role] && matrix[role][a.key] === true
  );
  if (!allowed.length) return "No special permissions (read-only)";
  return allowed.map((a) => `${a.section}: ${a.label}`).join("\n");
}

// Expose globally for inline scripts (non-module consumers)
if (typeof window !== "undefined") {
  window.ActionsRegistry = window.ActionsRegistry || {};
  window.ActionsRegistry.ACTIONS = ACTIONS;
  window.ActionsRegistry.ROLES = ROLES;
  window.ActionsRegistry.roleRank = roleRank;
}
