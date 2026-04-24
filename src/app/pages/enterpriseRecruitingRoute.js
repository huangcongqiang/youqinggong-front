export function resolveRecruitingSuccessRoute(actionId, response) {
  const nextRoute = typeof response?.nextRoute === "string" ? response.nextRoute.trim() : "";
  if (!nextRoute) {
    return "";
  }
  return String(actionId || "").startsWith("confirm-") ? nextRoute : "";
}
