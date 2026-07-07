export const ROLES = { // Frontend role keys used for access control
  ADMIN: "admin",
  PRODUCT_ANALYST: "product_analyst",
  SUPPORT_LEAD: "support_lead",
};

export const ROLE_LABELS = { // Display labels for each role
  [ROLES.ADMIN]: "Admin",
  [ROLES.PRODUCT_ANALYST]: "Product Analyst",
  [ROLES.SUPPORT_LEAD]: "Support Lead",
};

export const MENU_ITEMS = [ // Sidebar menu configuration with role access
  {
    label: "Dashboard",
    path: "/dashboard",
    allowedRoles: [ROLES.ADMIN, ROLES.PRODUCT_ANALYST, ROLES.SUPPORT_LEAD],
  },
  {
    label: "Add Feedback",
    path: "/add-feedback",
    allowedRoles: [ROLES.ADMIN, ROLES.PRODUCT_ANALYST],
  },
  {
    label: "Feedback List",
    path: "/feedback-list",
    allowedRoles: [ROLES.ADMIN, ROLES.PRODUCT_ANALYST, ROLES.SUPPORT_LEAD],
  },
  {
    label: "Report & Analytics",
    path: "/monthly-report",
    allowedRoles: [ROLES.ADMIN, ROLES.PRODUCT_ANALYST, ROLES.SUPPORT_LEAD],
  },
  {
    label: "User Management",
    path: "/users",
    allowedRoles: [ROLES.ADMIN],
  },
];

export function isRoleAllowed(userRole, allowedRoles = []) { // Checks if role has permission
  if (!userRole || !Array.isArray(allowedRoles)) {
    return false;
  }

  return allowedRoles.includes(userRole);
}

export function getVisibleMenuItems(userRole) { // Returns only menu items visible to the role
  return MENU_ITEMS.filter((item) => isRoleAllowed(userRole, item.allowedRoles));
}

export function getRoleLabel(role) { // Converts role key to readable label
  return ROLE_LABELS[role] || role || "User";
}

export function mapBackendRoleToFrontend(role) { // Converts backend role label to frontend role key
  const roleMap = {
    Admin: ROLES.ADMIN,
    "Product Analyst": ROLES.PRODUCT_ANALYST,
    Analyst: ROLES.PRODUCT_ANALYST,
    "Product Lead": ROLES.PRODUCT_ANALYST,
    "Support Lead": ROLES.SUPPORT_LEAD,
  };

  return roleMap[role] || ROLES.PRODUCT_ANALYST;
}

export function mapFrontendRoleToBackend(role) { // Converts frontend role key to backend role label
  const roleMap = {
    [ROLES.ADMIN]: "Admin",
    [ROLES.PRODUCT_ANALYST]: "Product Analyst",
    [ROLES.SUPPORT_LEAD]: "Support Lead",
  };

  return roleMap[role] || role;
}