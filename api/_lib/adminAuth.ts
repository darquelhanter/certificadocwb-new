// Lightweight admin gate for the leads CRM: the client re-sends the plain
// password on every admin request (over HTTPS) via the x-admin-password
// header, and the server compares it to ADMIN_PASSWORD. No sessions/tokens —
// deliberately simple for a single-admin internal tool.
export function isAuthorized(providedPassword: unknown): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  return typeof providedPassword === 'string' && providedPassword === expected;
}
