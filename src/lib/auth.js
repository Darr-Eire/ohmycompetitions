// file: src/lib/auth.js
export function clearAuthCookies(res) {
  res.setHeader('Set-Cookie', [
    'omc_admin_user=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax',
    'omc_admin_pass=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax',
    'omc_admin_token=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax',
  ]);
}
