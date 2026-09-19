export const AUTH_SESSION_KEY = 'mfx-workspace-authenticated';

export function credentialsAreValid(username: string, password: string) {
  return username.trim() === 'mfx-admin' && password === 'mfx2026';
}
