// Client des workflows backend (hébergés côté Zite / Fillout).
// Le code serveur de ces workflows n'est PAS dans le bundle public :
// il faut le recréer (ou le récupérer dans l'éditeur Zite).

const APP_ID = "wv4ekz4vx6";
const SERVER_URL = "https://workflows.fillout.com";

async function callWorkflow<TOut>(workflowId: string, inputs: unknown): Promise<TOut> {
  const res = await fetch(`${SERVER_URL}/public/${APP_ID}/workflow/execute`, {
    method: "POST",
    credentials: "include",
    headers: { "content-type": "application/json;charset=UTF-8" },
    body: JSON.stringify({ inputs, mode: "live", workflowId }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Error with endpoint ${workflowId} status: ${res.status}`);
  }
  return res.json();
}

// ---- Auth ----
export type CheckEmailResult = { status: "not_found" | "no_password" | "has_password" };
export type AuthResult = { userId: string; firstName?: string; sessionToken: string };
export type ResetResult = AuthResult & { email: string };
export type VerifyResult = { valid: boolean; email?: string; userId?: string; firstName?: string };

export const authCheckEmail = (inputs: { email: string }) =>
  callWorkflow<CheckEmailResult>("authCheckEmail", inputs);

export const authSetPassword = (inputs: { email: string; password: string }) =>
  callWorkflow<AuthResult>("authSetPassword", inputs);

export const authLogin = (inputs: { email: string; password: string }) =>
  callWorkflow<AuthResult>("authLogin", inputs);

export const authForgotPassword = (inputs: { email: string }) =>
  callWorkflow<{ ok: boolean }>("authForgotPassword", inputs);

export const authResetPassword = (inputs: { resetToken: string; newPassword: string }) =>
  callWorkflow<ResetResult>("authResetPassword", inputs);

export const authVerifySession = (inputs: { sessionToken: string }) =>
  callWorkflow<VerifyResult>("authVerifySession", inputs);

// ---- Checklist ----
export const getChecklist = (inputs: { sessionToken: string }) =>
  callWorkflow<{ checkedItems: number[] }>("getChecklist", inputs);

export const updateChecklist = (inputs: { sessionToken: string; checkedItems: number[] }) =>
  callWorkflow<{ ok: boolean }>("updateChecklist", inputs);
