/**
 * Admin authentication and authorization utilities.
 *
 * Configured Admin Credentials:
 * User ID / Email: adminfortunetourism@gmail.com
 * Password: Admin@fortunetourism2026
 */

export const ADMIN_CONFIG = {
  DEFAULT_EMAIL: "adminfortunetourism@gmail.com",
  DEFAULT_PASSWORD: "Admin@fortunetourism2026",
};

export function getAdminEmail(): string {
  return (process.env.ADMIN_EMAIL || ADMIN_CONFIG.DEFAULT_EMAIL).trim().toLowerCase();
}

export function getAdminPassword(): string {
  return (process.env.ADMIN_PASSWORD || ADMIN_CONFIG.DEFAULT_PASSWORD).trim();
}

export function validateAdminCredentials(email?: string, password?: string): boolean {
  if (!email || !password) return false;

  const validEmail = getAdminEmail();
  const validPassword = getAdminPassword();

  const inputEmail = String(email).trim().toLowerCase();
  const inputPassword = String(password).trim();

  return inputEmail === validEmail && inputPassword === validPassword;
}

export function isAdminAuthorized(request: Request): boolean {
  const validPwd = getAdminPassword();
  const defaultPwd = ADMIN_CONFIG.DEFAULT_PASSWORD;

  const headerKey = request.headers.get("x-admin-key") || request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (headerKey) {
    const trimmed = headerKey.trim();
    if (trimmed === validPwd || trimmed === defaultPwd) return true;
  }

  const cookie = request.headers.get("cookie") || "";
  const match = cookie.match(/(?:^|;\s*)fortune_admin_key=([^;]+)/);
  if (match) {
    const decoded = decodeURIComponent(match[1]).trim();
    if (decoded === validPwd || decoded === defaultPwd) return true;
  }

  return false;
}

export function unauthorizedResponse(msg: string = "Unauthorized. Admin authentication required."): Response {
  return new Response(
    JSON.stringify({ success: false, error: msg }),
    { status: 401, headers: { "Content-Type": "application/json" } },
  );
}
