// lib/roles.js
export function dashboardPathForRole(role) {
  if (role === "admin") return "/admin";
  if (role === "teacher") return "/teacher";
  return "/student";
}