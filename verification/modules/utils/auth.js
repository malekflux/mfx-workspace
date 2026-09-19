// src/utils/auth.ts
var AUTH_SESSION_KEY = "mfx-workspace-authenticated";
function credentialsAreValid(username, password) {
  return username.trim() === "mfx-admin" && password === "mfx2026";
}
export {
  AUTH_SESSION_KEY,
  credentialsAreValid
};
