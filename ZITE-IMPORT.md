# PROMPT À COLLER DANS ZITE (ou dans claude.ai avec le connecteur Zite)

Recrée cette app React + Tailwind telle quelle, fichier par fichier, sans rien changer au design ni aux textes.
Crée aussi les 8 workflows backend décrits à la fin (table users + table checklist).
Utilise exactement les noms de workflows indiqués, les vues les appellent par ce nom.

---

## FICHIER : src/main.tsx

```tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ErrorBoundary } from "react-error-boundary";
import App from "./App";
import "./index.css";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary
      fallbackRender={({ error }) => (
        <div className="fixed inset-0 grid place-items-center">
          <div className="relative w-full max-w-xl rounded border-t-4 border-t-red-500 bg-white p-4 shadow-lg">
            <h3 className="mb-2 flex items-center gap-2 font-medium">Issue rendering app</h3>
            <pre className="overflow-auto rounded border-l-4 border-red-500 bg-red-50 p-4 font-mono text-sm text-red-900">
              {error.message}
            </pre>
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => window.location.reload()}
                className="flex items-center gap-2 rounded border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-sm font-medium text-gray-500 transition hover:bg-gray-100"
              >
                Reload
              </button>
            </div>
          </div>
        </div>
      )}
    >
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
```

## FICHIER : src/App.tsx

```tsx
import { AuthProvider, useCustomAuth } from "@/contexts/AuthContext";
import { LoginView } from "@/views/LoginView";
import { MainApp } from "@/views/MainApp";

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
      <span className="text-5xl">🌴</span>
      <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function Router() {
  const { user, isLoading } = useCustomAuth();
  const resetToken = new URLSearchParams(window.location.search).get("reset");

  if (isLoading) return <LoadingScreen />;
  if (resetToken) return <LoginView initialResetToken={resetToken} />;
  if (user) return <MainApp />;
  return <LoginView />;
}

export default function App() {
  return (
    <AuthProvider>
      <Router />
    </AuthProvider>
  );
}
```

## FICHIER : src/types/index.ts

```ts
export interface AuthUser {
  email: string;
  userId: string;
  firstName?: string;
}

export interface ChecklistItem {
  section: string;
  text: string;
  link?: string;
}

export interface GridItem {
  emoji: string;
  label: string;
  note?: string;
  kind: "good" | "bad";
}

export type ContentNode =
  | { type: "p"; text: string }
  | { type: "list"; items: string[] }
  | { type: "tags"; items: string[] }
  | { type: "link"; url: string; label: string }
  | { type: "grid"; gridItems: GridItem[] };

export interface InfoBlock {
  ico: string;
  logoUrl?: string;
  title: string;
  content: ContentNode[];
}

export interface InfoPage {
  key: string;
  title: string;
  intro: string;
  blocks: InfoBlock[];
}

export interface Tile {
  key: string;
  ico: string;
  label: string;
}
```

## FICHIER : src/api/workflows.ts

```ts
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
```

## FICHIER : src/contexts/AuthContext.tsx

```tsx
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { authVerifySession } from "@/api/workflows";
import type { AuthUser } from "@/types";

interface AuthContextValue {
  user: AuthUser | null;
  sessionToken: string | null;
  isLoading: boolean;
  completeAuth: (user: AuthUser, token: string, remember: boolean) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const STORAGE_KEY = "tev_session_v2";

function clearStoredSession() {
  localStorage.removeItem(STORAGE_KEY);
  sessionStorage.removeItem(STORAGE_KEY);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) || sessionStorage.getItem(STORAGE_KEY);
    if (!stored) {
      setIsLoading(false);
      return;
    }
    try {
      const { token } = JSON.parse(stored) as { token: string };
      authVerifySession({ sessionToken: token })
        .then((res) => {
          if (res.valid && res.email && res.userId) {
            setUser({ email: res.email, userId: res.userId, firstName: res.firstName });
            setSessionToken(token);
          } else {
            clearStoredSession();
          }
        })
        .catch(() => clearStoredSession())
        .finally(() => setIsLoading(false));
    } catch {
      setIsLoading(false);
    }
  }, []);

  const completeAuth = (nextUser: AuthUser, token: string, remember: boolean) => {
    const payload = JSON.stringify({ token });
    if (remember) localStorage.setItem(STORAGE_KEY, payload);
    else sessionStorage.setItem(STORAGE_KEY, payload);
    setUser(nextUser);
    setSessionToken(token);
  };

  const logout = () => {
    clearStoredSession();
    setUser(null);
    setSessionToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, sessionToken, isLoading, completeAuth, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useCustomAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useCustomAuth must be used within AuthProvider");
  return ctx;
}
```

## FICHIER : src/views/MainApp.tsx

```tsx
import { useState } from "react";
import { DashboardView } from "@/views/DashboardView";
import { ChecklistView } from "@/views/ChecklistView";
import { InfoView } from "@/views/InfoView";
import { INFO_PAGES } from "@/data/content";

type Screen = "dashboard" | "checklist" | "info";

export function MainApp() {
  const [screen, setScreen] = useState<Screen>("dashboard");
  const [pageKey, setPageKey] = useState("");

  const openPage = (key: string) => {
    if (key === "checklist") {
      setScreen("checklist");
    } else {
      setPageKey(key);
      setScreen("info");
    }
  };
  const goBack = () => setScreen("dashboard");

  if (screen === "checklist") return <ChecklistView onBack={goBack} />;
  if (screen === "info") {
    const page = INFO_PAGES.find((p) => p.key === pageKey);
    return page ? <InfoView page={page} onBack={goBack} /> : null;
  }
  return <DashboardView onOpenPage={openPage} />;
}
```

## FICHIER : src/views/LoginView.tsx

```tsx
import { useState } from "react";
import { Eye, EyeOff, LoaderCircle } from "lucide-react";
import { useCustomAuth } from "@/contexts/AuthContext";
import {
  authCheckEmail,
  authSetPassword,
  authLogin,
  authForgotPassword,
  authResetPassword,
} from "@/api/workflows";

type Step = "email" | "create" | "login" | "forgot" | "forgotSent" | "reset";

const inputClass =
  "w-full h-12 px-4 rounded-xl border-2 border-border bg-background text-sm text-foreground outline-none focus:border-primary transition-colors";
const primaryBtnClass =
  "w-full h-12 rounded-xl bg-primary text-primary-foreground text-sm font-bold disabled:opacity-50 flex items-center justify-center gap-2";

export function LoginView({ initialResetToken }: { initialResetToken?: string }) {
  const { completeAuth } = useCustomAuth();
  const [step, setStep] = useState<Step>(initialResetToken ? "reset" : "email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const run = async (fn: () => Promise<void>) => {
    setLoading(true);
    setError("");
    try {
      await fn();
    } catch (e: any) {
      setError(e.message || "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  const handleEmail = () =>
    run(async () => {
      const res = await authCheckEmail({ email: email.trim() });
      if (res.status === "not_found") throw new Error("Cet email n'est pas autorisé");
      setStep(res.status === "no_password" ? "create" : "login");
    });

  const handleCreate = () =>
    run(async () => {
      if (password.length < 8) throw new Error("Mot de passe trop court (8 caractères min.)");
      if (password !== confirm) throw new Error("Les mots de passe ne correspondent pas");
      const res = await authSetPassword({ email: email.trim(), password });
      completeAuth(
        { email: email.trim(), userId: res.userId, firstName: res.firstName },
        res.sessionToken,
        remember
      );
    });

  const handleLogin = () =>
    run(async () => {
      const res = await authLogin({ email: email.trim(), password });
      completeAuth(
        { email: email.trim(), userId: res.userId, firstName: res.firstName },
        res.sessionToken,
        remember
      );
    });

  const handleForgot = () =>
    run(async () => {
      await authForgotPassword({ email: email.trim() });
      setStep("forgotSent");
    });

  const handleReset = () =>
    run(async () => {
      if (password.length < 8) throw new Error("Mot de passe trop court (8 caractères min.)");
      if (password !== confirm) throw new Error("Les mots de passe ne correspondent pas");
      const res = await authResetPassword({ resetToken: initialResetToken!, newPassword: password });
      completeAuth(
        { email: res.email, userId: res.userId, firstName: res.firstName },
        res.sessionToken,
        true
      );
    });

  const toggleShow = () => setShowPassword((s) => !s);
  const errorEl = error && <p className="text-xs text-destructive font-medium">{error}</p>;
  const spinner = loading && <LoaderCircle size={15} className="animate-spin" />;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-5">
      <div className="w-full max-w-sm">
        <div className="bg-card border border-border rounded-3xl p-7 shadow-sm">
          <div className="text-center mb-7">
            <span className="text-5xl block mb-3">🌴</span>
            <h1 className="text-xl font-bold text-foreground tracking-tight">Ton Espace Voyage</h1>
            <p className="text-xs text-muted-foreground mt-1">
              Toutes les infos utiles pour partir sereinement
            </p>
          </div>

          {step === "email" && (
            <div className="space-y-3">
              <label className="block text-xs font-bold text-foreground uppercase tracking-wider">
                Adresse email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleEmail()}
                placeholder="sophie@email.com"
                autoFocus
                className={inputClass}
              />
              {errorEl}
              <button onClick={handleEmail} disabled={!email || loading} className={primaryBtnClass}>
                {spinner} Continuer →
              </button>
            </div>
          )}

          {step === "create" && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Crée un mot de passe pour <strong className="text-foreground">{email}</strong>
              </p>
              <PasswordInput
                value={password}
                onChange={setPassword}
                show={showPassword}
                onToggle={toggleShow}
                placeholder="Mot de passe (8 car. min.)"
              />
              <PasswordInput
                value={confirm}
                onChange={setConfirm}
                show={showPassword}
                onToggle={toggleShow}
                placeholder="Confirmer le mot de passe"
                onEnter={handleCreate}
              />
              <RememberMe checked={remember} onChange={setRemember} />
              {errorEl}
              <button
                onClick={handleCreate}
                disabled={!password || !confirm || loading}
                className={primaryBtnClass}
              >
                {spinner} Créer mon compte
              </button>
              <button
                onClick={() => setStep("email")}
                className="w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors py-1"
              >
                ← Changer d'email
              </button>
            </div>
          )}

          {step === "login" && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Connexion avec <strong className="text-foreground">{email}</strong>
              </p>
              <PasswordInput
                value={password}
                onChange={setPassword}
                show={showPassword}
                onToggle={toggleShow}
                placeholder="Mot de passe"
                onEnter={handleLogin}
                autoFocus
              />
              <RememberMe checked={remember} onChange={setRemember} />
              {errorEl}
              <button onClick={handleLogin} disabled={!password || loading} className={primaryBtnClass}>
                {spinner} Se connecter
              </button>
              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={() => setStep("email")}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  ← Changer d'email
                </button>
                <button
                  onClick={() => setStep("forgot")}
                  className="text-xs text-primary hover:underline font-medium"
                >
                  Mot de passe oublié ?
                </button>
              </div>
            </div>
          )}

          {step === "forgot" && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Entrez votre email pour recevoir un lien de réinitialisation.
              </p>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleForgot()}
                placeholder="sophie@email.com"
                autoFocus
                className={inputClass}
              />
              {errorEl}
              <button onClick={handleForgot} disabled={!email || loading} className={primaryBtnClass}>
                {spinner} Envoyer le lien
              </button>
              <button
                onClick={() => setStep("login")}
                className="w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors py-1"
              >
                ← Retour
              </button>
            </div>
          )}

          {step === "forgotSent" && (
            <div className="text-center space-y-4">
              <span className="text-4xl">📧</span>
              <p className="text-sm font-medium text-foreground">Email envoyé !</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Si votre email est autorisé, vous recevrez un lien valable <strong>1 heure</strong>.
              </p>
              <button
                onClick={() => {
                  setStep("login");
                  setPassword("");
                }}
                className="text-xs text-primary hover:underline font-medium"
              >
                ← Retour à la connexion
              </button>
            </div>
          )}

          {step === "reset" && (
            <div className="space-y-3">
              <p className="text-sm font-medium text-foreground">Créer un nouveau mot de passe</p>
              <PasswordInput
                value={password}
                onChange={setPassword}
                show={showPassword}
                onToggle={toggleShow}
                placeholder="Nouveau mot de passe (8 car. min.)"
                autoFocus
              />
              <PasswordInput
                value={confirm}
                onChange={setConfirm}
                show={showPassword}
                onToggle={toggleShow}
                placeholder="Confirmer le mot de passe"
                onEnter={handleReset}
              />
              {errorEl}
              <button
                onClick={handleReset}
                disabled={!password || !confirm || loading}
                className={primaryBtnClass}
              >
                {spinner} Réinitialiser
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PasswordInput({
  value,
  onChange,
  show,
  onToggle,
  placeholder,
  onEnter,
  autoFocus,
}: {
  value: string;
  onChange: (v: string) => void;
  show: boolean;
  onToggle: () => void;
  placeholder: string;
  onEnter?: () => void;
  autoFocus?: boolean;
}) {
  return (
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onEnter?.()}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="w-full h-12 pl-4 pr-12 rounded-xl border-2 border-border bg-background text-sm text-foreground outline-none focus:border-primary transition-colors"
      />
      <button
        type="button"
        onClick={onToggle}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
      >
        {show ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
}

function RememberMe({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer select-none">
      <div
        onClick={() => onChange(!checked)}
        className={`w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center transition-all cursor-pointer ${
          checked ? "bg-primary border-primary" : "border-border bg-background"
        }`}
      >
        {checked && (
          <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
            <path d="M1 4.5L4 7.5L10 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      <span className="text-sm text-foreground font-medium">Se souvenir de moi</span>
    </label>
  );
}
```

## FICHIER : src/views/DashboardView.tsx

```tsx
import { useEffect, useRef, useState } from "react";
import { useCustomAuth } from "@/contexts/AuthContext";
import { getChecklist } from "@/api/workflows";
import { DASHBOARD_TILES, CHECKLIST_ITEMS } from "@/data/content";

const TOTAL_ITEMS = CHECKLIST_ITEMS.length;
const MAP_URL = "https://www.google.com/maps/d/u/1/viewer?mid=1O01Cju-3dOm6I4Y489YPjyblVruuniA";
const INSTAGRAM_URL = "https://www.instagram.com/";

const tileClass =
  "bg-card border-2 border-border rounded-2xl aspect-square flex flex-col items-center justify-center gap-2.5 hover:border-primary/40 hover:bg-primary/5 active:scale-95 transition-all";

export function DashboardView({ onOpenPage }: { onOpenPage: (key: string) => void }) {
  const { user, sessionToken, logout } = useCustomAuth();
  const [checkedCount, setCheckedCount] = useState<number | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const displayName = user?.firstName || user?.email?.split("@")[0] || "voyageur";
  const initial = displayName.charAt(0).toUpperCase();
  const isComplete = checkedCount !== null && checkedCount === TOTAL_ITEMS;

  useEffect(() => {
    if (!sessionToken) return;
    getChecklist({ sessionToken })
      .then((res) => setCheckedCount(res.checkedItems.length))
      .catch(() => setCheckedCount(0));
  }, [sessionToken]);

  useEffect(() => {
    if (!menuOpen) return;
    const onClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [menuOpen]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-card border-b border-border px-4 h-14 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <span className="text-lg">🌴</span>
          <span className="text-sm font-bold text-foreground tracking-tight">Ton Espace Voyage</span>
        </div>
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center text-sm font-bold text-primary hover:bg-primary/25 transition-colors"
          >
            {initial}
          </button>
          {menuOpen && (
            <div className="absolute top-11 right-0 bg-card border-2 border-border rounded-2xl shadow-lg p-1.5 z-20 min-w-[150px]">
              <div className="px-3 py-1.5 text-[11px] text-muted-foreground border-b border-border mb-1 truncate">
                {user?.email}
              </div>
              <button
                onClick={logout}
                className="w-full text-left text-sm px-3 py-2 rounded-xl text-destructive hover:bg-destructive/10 transition-colors font-semibold"
              >
                Déconnexion
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 px-4 pt-5 pb-10 w-full max-w-md mx-auto">
        <div className="mb-5">
          <h2 className="text-2xl font-bold text-foreground tracking-tight">Bonjour {displayName} 👋</h2>
          <p className="text-sm text-muted-foreground mt-1">Prépare ton séjour à Bali</p>
        </div>

        <button
          onClick={() => onOpenPage("checklist")}
          className={`w-full rounded-3xl p-5 text-left mb-5 active:scale-[0.98] transition-transform ${
            isComplete ? "bg-primary" : "bg-card border-2 border-primary/30"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-4xl">{isComplete ? "🎉" : "✅"}</span>
              <div>
                <p className={`text-base font-bold ${isComplete ? "text-primary-foreground" : "text-foreground"}`}>
                  {isComplete ? "Checklist complète !" : "Ma Checklist voyage"}
                </p>
                <p className={`text-sm mt-0.5 ${isComplete ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                  {checkedCount === null
                    ? "Chargement…"
                    : isComplete
                      ? "Tu es prêt(e) à partir 🌴"
                      : `${checkedCount} / ${TOTAL_ITEMS} tâches complétées`}
                </p>
              </div>
            </div>
            <span className={`text-xl font-light ${isComplete ? "text-primary-foreground" : "text-primary"}`}>›</span>
          </div>
          {!isComplete && checkedCount !== null && (
            <div className="mt-4 h-2 bg-primary/15 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full"
                style={{ width: `${Math.round((checkedCount / TOTAL_ITEMS) * 100)}%` }}
              />
            </div>
          )}
        </button>

        <div className="grid grid-cols-3 gap-3 mb-6">
          {DASHBOARD_TILES.map((tile) =>
            tile.key === "carte" ? (
              <a key={tile.key} href={MAP_URL} target="_blank" rel="noopener noreferrer" className={tileClass}>
                <span className="text-3xl">{tile.ico}</span>
                <span className="text-[11px] font-bold text-foreground text-center leading-tight px-1">{tile.label}</span>
              </a>
            ) : (
              <button key={tile.key} onClick={() => onOpenPage(tile.key)} className={tileClass}>
                <span className="text-3xl">{tile.ico}</span>
                <span className="text-[11px] font-bold text-foreground text-center leading-tight px-1">{tile.label}</span>
              </button>
            )
          )}
        </div>

        <div className="flex justify-center">
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 border-2 border-border rounded-full px-5 py-3 text-sm font-semibold text-foreground hover:border-primary/40 hover:bg-primary/5 transition-all"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" strokeWidth="1.8" />
              <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8" />
              <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" />
            </svg>
            Une question ? Contacte-moi
          </a>
        </div>
      </main>
    </div>
  );
}
```

## FICHIER : src/views/ChecklistView.tsx

```tsx
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useDebouncedCallback } from "use-debounce";
import { useCustomAuth } from "@/contexts/AuthContext";
import { getChecklist, updateChecklist } from "@/api/workflows";
import { CHECKLIST_ITEMS, CHECKLIST_SECTIONS } from "@/data/content";

const ITEMS_BY_SECTION = CHECKLIST_SECTIONS.reduce<Record<string, { text: string; link?: string; index: number }[]>>(
  (acc, section) => {
    acc[section] = CHECKLIST_ITEMS.map((item, index) => ({ ...item, index })).filter((i) => i.section === section);
    return acc;
  },
  {}
);

export function ChecklistView({ onBack }: { onBack: () => void }) {
  const { sessionToken } = useCustomAuth();
  const [checked, setChecked] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionToken) return;
    getChecklist({ sessionToken }).then((res) => {
      setChecked(new Set(res.checkedItems));
      setLoading(false);
    });
  }, [sessionToken]);

  const save = useDebouncedCallback((next: Set<number>) => {
    if (sessionToken) updateChecklist({ sessionToken, checkedItems: Array.from(next) });
  }, 900);

  const toggle = (index: number) => {
    const next = new Set(checked);
    if (next.has(index)) next.delete(index);
    else next.add(index);
    setChecked(next);
    save(next);
  };

  const total = CHECKLIST_ITEMS.length;
  const done = checked.size;
  const percent = total > 0 ? Math.round((done / total) * 100) : 0;
  const isComplete = done === total;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-card border-b border-border sticky top-0 z-10 px-4 h-14 flex items-center">
        <button
          onClick={onBack}
          className="flex items-center gap-2 bg-foreground text-background px-5 py-2.5 rounded-full text-sm font-bold hover:opacity-80 active:scale-[0.97] transition-all"
        >
          <ArrowLeft size={16} /> Retour
        </button>
      </header>

      <main className="flex-1 pb-12 max-w-md mx-auto w-full">
        <div className="px-4 pt-6 pb-5 border-b-2 border-border">
          <h1 className="text-3xl font-bold text-foreground mb-1">✅ Checklist voyage</h1>
          <p className="text-sm text-muted-foreground">Tout ce qu'il faut faire avant ton départ</p>
        </div>

        <div className="px-4 pt-5">
          <div className={`rounded-2xl p-5 mb-6 ${isComplete ? "bg-primary" : "bg-card border-2 border-border"}`}>
            <div className="flex justify-between items-center mb-3">
              <span className={`text-sm font-bold ${isComplete ? "text-primary-foreground" : "text-foreground"}`}>
                {isComplete ? "🎉 Tout est prêt, bon voyage !" : "Ta progression"}
              </span>
              <span className={`text-lg font-bold ${isComplete ? "text-primary-foreground" : "text-primary"}`}>
                {done}/{total}
              </span>
            </div>
            {!isComplete && (
              <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${percent}%` }}
                />
              </div>
            )}
          </div>

          {loading ? (
            <div className="flex justify-center py-10">
              <div className="w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            CHECKLIST_SECTIONS.map((section) => (
              <div key={section} className="mb-5">
                <div className="flex items-center gap-3 mb-2.5 px-1">
                  <span className="text-sm font-bold text-foreground">{section}</span>
                  <div className="flex-1 h-px bg-border" />
                </div>
                <div className="bg-card border-2 border-border rounded-2xl overflow-hidden">
                  {ITEMS_BY_SECTION[section].map((item, i) => {
                    const isChecked = checked.has(item.index);
                    return (
                      <div
                        key={item.index}
                        onClick={() => toggle(item.index)}
                        className={`flex items-start gap-3.5 px-4 py-4 cursor-pointer active:bg-muted/60 transition-colors ${
                          i > 0 ? "border-t border-border" : ""
                        }`}
                      >
                        <div
                          className={`mt-0.5 w-5 h-5 rounded-md flex-shrink-0 border-2 flex items-center justify-center transition-all ${
                            isChecked ? "bg-primary border-primary" : "border-border bg-background"
                          }`}
                        >
                          {isChecked && (
                            <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
                              <path d="M1 4.5L4 7.5L10 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-sm font-medium leading-relaxed transition-colors ${
                              isChecked ? "text-muted-foreground line-through" : "text-foreground"
                            }`}
                          >
                            {item.text}
                          </p>
                          {item.link && (
                            <a
                              href={item.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center gap-1.5 mt-2 text-xs font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-full hover:bg-primary/20 transition-colors"
                            >
                              Ouvrir le lien →
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
```

## FICHIER : src/views/InfoView.tsx

```tsx
import { Fragment, type ReactNode } from "react";
import { ArrowLeft, ExternalLink, Phone } from "lucide-react";
import type { ContentNode, GridItem, InfoPage } from "@/types";

/** Transforme "**gras**" et les retours à la ligne en JSX. */
function renderRich(text: string): ReactNode[] {
  return text.split("\n").flatMap((line, lineIdx) => {
    const parts = line.split(/\*\*(.*?)\*\*/g).map((part, i) =>
      i % 2 === 1 ? (
        <strong key={`${lineIdx}-${i}`} className="font-bold text-foreground">
          {part}
        </strong>
      ) : (
        <Fragment key={`${lineIdx}-${i}`}>{part}</Fragment>
      )
    );
    return lineIdx > 0 ? [<br key={`br-${lineIdx}`} />, ...parts] : parts;
  });
}

function GridCard({ item }: { item: GridItem }) {
  return (
    <div
      className={`rounded-2xl p-3.5 flex flex-col items-center text-center gap-2 border-2 ${
        item.kind === "bad" ? "bg-destructive/5 border-destructive/15" : "bg-primary/5 border-primary/15"
      }`}
    >
      <span className="text-4xl leading-none">{item.emoji}</span>
      <span className="text-xs font-bold text-foreground leading-snug">{item.label}</span>
      {item.note && <span className="text-[10px] text-muted-foreground leading-tight">{item.note}</span>}
    </div>
  );
}

function ContentBlock({ node }: { node: ContentNode }) {
  switch (node.type) {
    case "p":
      return <p className="text-[13px] text-muted-foreground leading-relaxed mb-2.5 last:mb-0">{renderRich(node.text)}</p>;
    case "list":
      return (
        <ul className="space-y-2 mb-3">
          {node.items.map((item, i) => (
            <li key={i} className="flex items-start gap-2.5 text-[13px] text-muted-foreground leading-relaxed">
              <span className="text-primary font-bold mt-0.5 flex-shrink-0">•</span>
              <span>{renderRich(item)}</span>
            </li>
          ))}
        </ul>
      );
    case "tags":
      return (
        <div className="flex flex-wrap gap-2 mb-4">
          {node.items.map((tag, i) => (
            <span key={i} className="bg-primary/10 text-primary text-xs font-bold px-3 py-1.5 rounded-full">
              {tag}
            </span>
          ))}
        </div>
      );
    case "link": {
      const isTel = node.url.startsWith("tel:");
      return (
        <a
          href={node.url}
          target={isTel ? "_self" : "_blank"}
          rel={isTel ? undefined : "noopener noreferrer"}
          className={`flex items-center justify-between w-full px-4 py-4 rounded-2xl mb-2.5 font-semibold text-sm transition-all active:scale-[0.98] ${
            isTel
              ? "bg-primary text-primary-foreground shadow-sm hover:opacity-90"
              : "bg-card border-2 border-border text-foreground hover:border-primary/40 hover:bg-primary/5"
          }`}
        >
          <span className="flex items-center gap-2.5">
            {isTel ? <Phone size={16} /> : <ExternalLink size={15} className="opacity-60" />}
            {node.label}
          </span>
          <span className="text-lg opacity-50">›</span>
        </a>
      );
    }
    case "grid":
      return (
        <div className="grid grid-cols-2 gap-3 mb-4">
          {node.gridItems.map((item, i) => (
            <GridCard key={i} item={item} />
          ))}
        </div>
      );
    default:
      return null;
  }
}

export function InfoView({ page, onBack }: { page: InfoPage; onBack: () => void }) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-card border-b border-border sticky top-0 z-10 px-4 h-14 flex items-center">
        <button
          onClick={onBack}
          className="flex items-center gap-2 bg-foreground text-background px-5 py-2.5 rounded-full text-sm font-bold hover:opacity-80 transition-all active:scale-[0.97]"
        >
          <ArrowLeft size={16} />
          Retour
        </button>
      </header>

      <main className="flex-1 pb-12 max-w-md mx-auto w-full">
        <div className="px-4 pt-6 pb-5 border-b-2 border-border">
          <h1 className="text-3xl font-bold text-foreground mb-2">{page.title}</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">{page.intro}</p>
        </div>

        <div className="px-4">
          {page.blocks.map((block, i) => (
            <div key={i}>
              <div className="py-4">
                <div className="flex items-center gap-3 mb-3">
                  {block.logoUrl ? (
                    <img
                      src={block.logoUrl}
                      alt=""
                      className="w-9 h-9 rounded-xl object-contain border border-border bg-card flex-shrink-0"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  ) : (
                    <span className="text-2xl leading-none">{block.ico}</span>
                  )}
                  <h2 className="text-[15px] font-bold text-foreground">{block.title}</h2>
                </div>
                <div className="pl-11">
                  {block.content.map((node, j) => (
                    <ContentBlock key={j} node={node} />
                  ))}
                </div>
              </div>
              {i < page.blocks.length - 1 && <div className="h-px bg-border" />}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
```

## FICHIER : src/data/content.ts

```ts
import type { ChecklistItem, InfoPage, Tile } from "@/types";

/** Tuiles du tableau de bord (hors "Carte"). */
export const TILES: Tile[] = [
  {
    key: "formalites",
    ico: "📋",
    label: "Formalités"
  },
  {
    key: "argent",
    ico: "💰",
    label: "Argent"
  },
  {
    key: "internet",
    ico: "📶",
    label: "Internet"
  },
  {
    key: "applis",
    ico: "📱",
    label: "Applis"
  },
  {
    key: "transports",
    ico: "🛵",
    label: "Transports"
  },
  {
    key: "valise",
    ico: "🧳",
    label: "Valise"
  },
  {
    key: "sante",
    ico: "🏥",
    label: "Santé"
  },
  {
    key: "urgence",
    ico: "🚨",
    label: "Urgence"
  }
];

/** Tuile "Carte" : lien externe vers Google My Maps. */
export const MAP_TILE: Tile = {
  key: "carte",
  ico: "🗺️",
  label: "Carte"
};

export const DASHBOARD_TILES: Tile[] = [...TILES, MAP_TILE];

/** Sections de la checklist, dans l'ordre d'affichage. */
export const CHECKLIST_SECTIONS = [
  "3 à 6 mois avant",
  "1 mois avant",
  "10 jours avant",
  "Derniers jours"
];

/** Items de la checklist. L'index dans ce tableau = id sauvegardé côté serveur. */
export const CHECKLIST_ITEMS: ChecklistItem[] = [
  {
    section: "3 à 6 mois avant",
    text: "Vérifier date péremption passeport (> 6 mois)"
  },
  {
    section: "3 à 6 mois avant",
    text: "Demander permis international (délais longs)",
    link: "https://permisdeconduire.ants.gouv.fr/"
  },
  {
    section: "3 à 6 mois avant",
    text: "Rdv médical pour point vaccin"
  },
  {
    section: "1 mois avant",
    text: "Appeler banque pour faire le point"
  },
  {
    section: "1 mois avant",
    text: "Vérifier les frais internationaux CB"
  },
  {
    section: "1 mois avant",
    text: "Vérifier les plafonds CB"
  },
  {
    section: "1 mois avant",
    text: "Commander une carte sans frais si besoin"
  },
  {
    section: "1 mois avant",
    text: "Vérifier les garanties de ton assurance CB"
  },
  {
    section: "1 mois avant",
    text: "Comparer les assurances voyage"
  },
  {
    section: "1 mois avant",
    text: "Réserver les premiers logements"
  },
  {
    section: "1 mois avant",
    text: "Vérifier ton forfait internet"
  },
  {
    section: "1 mois avant",
    text: "Préparer trousse médicale"
  },
  {
    section: "10 jours avant",
    text: "Avoir un billet de sortie ou de continuation"
  },
  {
    section: "10 jours avant",
    text: "Faire ton visa en ligne",
    link: "https://evisa.imigrasi.go.id/"
  },
  {
    section: "10 jours avant",
    text: "Payer la taxe touristique",
    link: "https://lovebali.baliprov.go.id/"
  },
  {
    section: "10 jours avant",
    text: "Remplir le Fil d'Ariane",
    link: "https://fildariane.diplomatie.gouv.fr/fildariane-internet/se-connecter"
  },
  {
    section: "10 jours avant",
    text: "Scanner tes documents de voyage"
  },
  {
    section: "10 jours avant",
    text: "Télécharger les applis nécessaires"
  },
  {
    section: "Derniers jours",
    text: "Compléter All Indonesia (3j avant)",
    link: "https://allindonesia.imigrasi.go.id/"
  },
  {
    section: "Derniers jours",
    text: "Faire ton check-in avion (24H avant)"
  },
  {
    section: "Derniers jours",
    text: "Installer ton eSIM (si nécessaire)"
  },
  {
    section: "Derniers jours",
    text: "Préparer sac / valise"
  }
];

/** Contenu des pages d'information. "**texte**" = gras. */
export const INFO_PAGES: InfoPage[] = [
  {
    key: "formalites",
    title: "📋 Formalités",
    intro: "Détails des démarches à faire avant de partir.",
    blocks: [
      {
        ico: "🛂",
        title: "Passeport",
        content: [
          {
            type: "p",
            text: "Validité **obligatoire de plus de 6 mois** à la date d'arrivée. Il doit être en parfait état."
          },
          {
            type: "p",
            text: "Garde une copie numérique sur ton téléphone."
          }
        ]
      },
      {
        ico: "🏍️",
        title: "Permis international",
        content: [
          {
            type: "p",
            text: "**Obligatoire** pour louer un scoot et être couvert par l'assurance (en plus du permis moto)."
          },
          {
            type: "p",
            text: "À demander sur le site de l'ANTS — la procédure peut prendre du temps **(3 à 6 mois)**."
          },
          {
            type: "p",
            text: "Prends toujours ton permis français avec toi également."
          },
          {
            type: "link",
            url: "https://permisdeconduire.ants.gouv.fr/",
            label: "Faire la demande sur ANTS"
          }
        ]
      },
      {
        ico: "🧭",
        title: "Fil d'Ariane",
        content: [
          {
            type: "p",
            text: "Pas obligatoire mais recommandé. Inscris-toi pour être alerté(e) en cas de crise politique, sanitaire ou météo."
          },
          {
            type: "link",
            url: "https://fildariane.diplomatie.gouv.fr/fildariane-internet/se-connecter",
            label: "S'inscrire au Fil d'Ariane"
          }
        ]
      },
      {
        ico: "✈️",
        title: "Visa",
        content: [
          {
            type: "p",
            text: "Valable **30 jours**, renouvelable une fois sur place. **Billet de sortie obligatoire.**"
          },
          {
            type: "p",
            text: "À faire en ligne **10 jours avant le départ** (recommandé) ou directement à l'aéroport à l'arrivée."
          },
          {
            type: "tags",
            items: [
              "500 000 IDR — 25€ / personne"
            ]
          },
          {
            type: "link",
            url: "https://evisa.imigrasi.go.id/",
            label: "Site officiel E-Visa Indonésie"
          },
          {
            type: "link",
            url: "https://www.instagram.com/p/DNN1WMhyRLG/",
            label: "Voir le tuto Instagram"
          }
        ]
      },
      {
        ico: "🏝️",
        title: "Taxe touristique Bali",
        content: [
          {
            type: "p",
            text: "À payer en ligne avant de partir (recommandé) ou à l'aéroport à l'arrivée."
          },
          {
            type: "tags",
            items: [
              "~9€ / personne"
            ]
          },
          {
            type: "link",
            url: "https://lovebali.baliprov.go.id/",
            label: "Payer la taxe en ligne"
          },
          {
            type: "link",
            url: "https://www.instagram.com/p/DNinka4Snax/",
            label: "Voir le tuto Instagram"
          }
        ]
      },
      {
        ico: "🛃",
        title: "All Indonesia",
        content: [
          {
            type: "p",
            text: "Déclaration obligatoire, à faire dans les **3 jours avant l'arrivée**. C'est gratuit."
          },
          {
            type: "p",
            text: "En couple ou en famille :\n2 déclarations = 1 seul QR code."
          },
          {
            type: "link",
            url: "https://allindonesia.imigrasi.go.id/",
            label: "Remplir All Indonesia"
          },
          {
            type: "link",
            url: "https://www.instagram.com/reel/DScjUFKjCUS/",
            label: "Voir le tuto Instagram"
          }
        ]
      }
    ]
  },
  {
    key: "argent",
    title: "💰 Argent",
    intro: "Évite les mauvaises surprises ou les arnaques.",
    blocks: [
      {
        ico: "💳",
        title: "Carte bancaire",
        content: [
          {
            type: "p",
            text: "**Appelle ta banque** pour vérifier tes frais à l'étranger avant de partir."
          },
          {
            type: "p",
            text: "Les meilleures options sans frais : **Revolut**, **Fortuneo**, **Boursorama** ou **N26**."
          },
          {
            type: "p",
            text: "Emporte toujours **2 cartes** en cas de vol ou de carte avalée."
          }
        ]
      },
      {
        ico: "🏧",
        title: "Retraits ATM",
        content: [
          {
            type: "p",
            text: "Utilise de préférence les distributeurs **BCA**, **BNI**, **BRI**, **Mandiri** ou **Maybank** pour limiter les frais locaux."
          },
          {
            type: "p",
            text: "Limite de retrait : entre **150€ et 250€** par transaction selon les banques."
          }
        ]
      },
      {
        ico: "💵",
        title: "Cash & change",
        content: [
          {
            type: "p",
            text: "Beaucoup de paiements se font sans contact (+3% de frais imposés souvent) ou en cash. Garde toujours un peu de liquide sur toi."
          },
          {
            type: "p",
            text: "**Attention aux arnaques** dans les bureaux de change — recompte toujours la somme avant de partir."
          }
        ]
      }
    ]
  },
  {
    key: "internet",
    title: "📶 Internet",
    intro: "Rien de compliqué pour avoir internet sur place — Voici 3 options selon ton profil.",
    blocks: [
      {
        ico: "📡",
        title: "Forfait international",
        content: [
          {
            type: "p",
            text: "Vérifie ce que ton opérateur propose avant de partir."
          },
          {
            type: "p",
            text: "**Free** et **Bouygues** incluent souvent l'Indonésie. **Orange** propose des options entre 29,99€ et 39,99€."
          }
        ]
      },
      {
        ico: "📲",
        title: "eSIM",
        content: [
          {
            type: "p",
            text: "Solution pratique : tout se configure depuis ton téléphone, sans changer de carte SIM."
          },
          {
            type: "p",
            text: "Regarde **Airalo**, **Holafly** ou **Saily**. Vérifie d'abord que ton téléphone est compatible eSIM dans les paramètres."
          },
          {
            type: "link",
            url: "https://www.airalo.com/",
            label: "Voir Airalo (eSIM)"
          }
        ]
      },
      {
        ico: "📶",
        title: "SIM locale",
        content: [
          {
            type: "p",
            text: "**Meilleure option** pour une connexion stable à petit prix."
          },
          {
            type: "p",
            text: "**Telkomsel** est le réseau le plus fiable. À acheter directement à l'aéroport à l'arrivée — tu choisis la durée et le volume de data."
          }
        ]
      },
      {
        ico: "💡",
        title: "À savoir",
        content: [
          {
            type: "p",
            text: "La wifi est disponible dans la **quasi-totalité des hébergements, restaurants et cafés** de Bali."
          }
        ]
      }
    ]
  },
  {
    key: "applis",
    title: "📱 Applis",
    intro: "Pense à télécharger ces applis avant ton arrivée.",
    blocks: [
      {
        ico: "🚗",
        logoUrl: "https://www.google.com/s2/favicons?domain=grab.com&sz=64",
        title: "Grab — Taxi voiture",
        content: [
          {
            type: "p",
            text: "L'équivalent d'Uber à Bali — **le plus fiable pour les trajets en voiture**."
          },
          {
            type: "link",
            url: "https://apps.apple.com/sg/app/grab-taxi-ride-hailing-app/id647268330",
            label: "🍎 App Store (iPhone)"
          },
          {
            type: "link",
            url: "https://play.google.com/store/apps/details?id=com.grab.passenger",
            label: "🤖 Play Store (Android)"
          }
        ]
      },
      {
        ico: "🛵",
        logoUrl: "https://www.google.com/s2/favicons?domain=gojek.com&sz=64",
        title: "Gojek — Taxi scoot",
        content: [
          {
            type: "p",
            text: "Parfait pour les **petits trajets rapides en scooter**, plus souple sur les courtes distances."
          },
          {
            type: "link",
            url: "https://apps.apple.com/id/app/gojek/id944875099",
            label: "🍎 App Store (iPhone)"
          },
          {
            type: "link",
            url: "https://play.google.com/store/apps/details?id=com.gojek.app",
            label: "🤖 Play Store (Android)"
          }
        ]
      },
      {
        ico: "💬",
        logoUrl: "https://www.google.com/s2/favicons?domain=whatsapp.com&sz=64",
        title: "WhatsApp — Messages",
        content: [
          {
            type: "p",
            text: "Reste en contact avec tes proches depuis l'autre bout du monde, **gratuitement en wifi**."
          },
          {
            type: "link",
            url: "https://apps.apple.com/app/whatsapp-messenger/id310633997",
            label: "🍎 App Store (iPhone)"
          },
          {
            type: "link",
            url: "https://play.google.com/store/apps/details?id=com.whatsapp",
            label: "🤖 Play Store (Android)"
          }
        ]
      },
      {
        ico: "⛵",
        logoUrl: "https://www.google.com/s2/favicons?domain=12go.com&sz=64",
        title: "12GO Asia — Bateaux",
        content: [
          {
            type: "p",
            text: "Réserve tes **trajets en bateau** entre les îles (Nusa Penida, Gili, Lombok) facilement."
          },
          {
            type: "link",
            url: "https://12go.com/en/",
            label: "Ouvrir 12GO Asia"
          },
          {
            type: "link",
            url: "https://apps.apple.com/th/app/12go-asia/id1547783024",
            label: "🍎 App Store (iPhone)"
          },
          {
            type: "link",
            url: "https://play.google.com/store/apps/details?id=com.rr12go.app",
            label: "🤖 Play Store (Android)"
          }
        ]
      },
      {
        ico: "🎯",
        logoUrl: "https://www.google.com/s2/favicons?domain=getyourguide.com&sz=64",
        title: "GetYourGuide — Activités",
        content: [
          {
            type: "p",
            text: "Réserve tes **activités, visites guidées et excursions** à Bali en quelques clics."
          },
          {
            type: "link",
            url: "https://www.getyourguide.com/",
            label: "Ouvrir GetYourGuide"
          },
          {
            type: "link",
            url: "https://apps.apple.com/app/getyourguide-tours-activities/id658085546",
            label: "🍎 App Store (iPhone)"
          },
          {
            type: "link",
            url: "https://play.google.com/store/apps/details?id=com.getyourguide.android",
            label: "🤖 Play Store (Android)"
          }
        ]
      },
      {
        ico: "💱",
        logoUrl: "https://www.google.com/s2/favicons?domain=xe.com&sz=64",
        title: "XE Currency — Convertisseur",
        content: [
          {
            type: "p",
            text: "Convertis les prix en **IDR (roupie indonésienne)** en temps réel pour éviter les surprises au change."
          },
          {
            type: "link",
            url: "https://apps.apple.com/app/xe-currency-converter-money/id455527054",
            label: "🍎 App Store (iPhone)"
          },
          {
            type: "link",
            url: "https://play.google.com/store/apps/details?id=com.xe.currency",
            label: "🤖 Play Store (Android)"
          }
        ]
      }
    ]
  },
  {
    key: "transports",
    title: "🛵 Transports",
    intro: "Ne sous-estime pas les temps de trajet (trafic et bouchons ++).",
    blocks: [
      {
        ico: "📱",
        title: "Grab & Gojek",
        content: [
          {
            type: "p",
            text: "Les applis de transport les plus pratiques. Grab pour commander un **taxi voiture**, Gojek pour un **taxi scooter**. Prix fixé à l'avance, pas de négociation."
          },
          {
            type: "p",
            text: "Peu disponibles dans le nord de Bali et les zones reculées."
          }
        ]
      },
      {
        ico: "🚗",
        title: "Chauffeur privé à la journée",
        content: [
          {
            type: "p",
            text: "La meilleure option si tu veux visiter plusieurs endroits dans une journée, voyager en couple ou en famille, ou ne pas conduire de scoot."
          },
          {
            type: "tags",
            items: [
              "Anglophone — 50 à 70€/jour",
              "Francophone — 80 à 100€/jour"
            ]
          }
        ]
      },
      {
        ico: "🛵",
        title: "Louer un scoot",
        content: [
          {
            type: "p",
            text: "Idéal pour être **autonome et flexible**. Avant de partir : prends des photos, vérifie les freins et les pneus, le **casque est obligatoire**."
          },
          {
            type: "p",
            text: "Pour être assuré(e) en cas d'accident : **permis moto + permis international obligatoires**."
          },
          {
            type: "p",
            text: "Le plus simple est de louer directement auprès de ton logement ou de mes contacts."
          },
          {
            type: "tags",
            items: [
              "3 à 5€ / jour"
            ]
          }
        ]
      },
      {
        ico: "⛵",
        title: "Bateaux inter-îles",
        content: [
          {
            type: "p",
            text: "Pour **Nusa Penida**, les **Gili** ou **Lombok**. Les bateaux peuvent être annulés selon la météo — garde un peu de flexibilité dans ton planning."
          },
          {
            type: "link",
            url: "https://12go.com/en/",
            label: "Réserver sur 12GO Asia"
          }
        ]
      },
      {
        ico: "🚌",
        title: "Bus & Shuttle",
        content: [
          {
            type: "p",
            text: "Pratique si tu voyages **solo** ou avec un petit budget."
          },
          {
            type: "link",
            url: "https://peramatour.com/b/en/shuttle-bus",
            label: "Perama — Navettes Bali"
          },
          {
            type: "link",
            url: "https://www.easybook.com/ms-my",
            label: "Easybook — Java"
          }
        ]
      },
      {
        ico: "🚂",
        title: "Trains à Java",
        content: [
          {
            type: "p",
            text: "Si tu combines **Bali et Java**, réserve tes trains via Traveloka — Yogyakarta, Malang, Surabaya."
          },
          {
            type: "link",
            url: "https://www.traveloka.com/",
            label: "Ouvrir Traveloka"
          },
          {
            type: "link",
            url: "https://apps.apple.com/id/app/traveloka-book-flight-hotel/id694892080",
            label: "🍎 App Store (iPhone)"
          },
          {
            type: "link",
            url: "https://play.google.com/store/apps/details?id=com.traveloka.htlexpress",
            label: "🤖 Play Store (Android)"
          }
        ]
      }
    ]
  },
  {
    key: "valise",
    title: "🧳 Valise",
    intro: "Ne te surcharge pas, voyage léger.",
    blocks: [
      {
        ico: "✅",
        title: "À prendre absolument",
        content: [
          {
            type: "grid",
            gridItems: [
              {
                emoji: "🧥",
                label: "Pull léger",
                note: "Avion, ferry & volcan",
                kind: "good"
              },
              {
                emoji: "🌂",
                label: "K-way fin",
                note: "Pluies & fraîcheur",
                kind: "good"
              },
              {
                emoji: "🧣",
                label: "Vêtements couvrants",
                note: "Foulard + jupe longue pour les temples",
                kind: "good"
              },
              {
                emoji: "🏊",
                label: "Serviette microfibre",
                note: "Légère & séchage rapide",
                kind: "good"
              },
              {
                emoji: "👟",
                label: "Chaussures confort",
                note: "Marches & trottoirs irréguliers",
                kind: "good"
              },
              {
                emoji: "🦟",
                label: "Anti-moustique",
                note: "Ubud, rizières & îles",
                kind: "good"
              }
            ]
          }
        ]
      },
      {
        ico: "❌",
        title: "À éviter",
        content: [
          {
            type: "grid",
            gridItems: [
              {
                emoji: "👚",
                label: "Trop de vêtements",
                note: "Laveries partout & pas chères",
                kind: "bad"
              },
              {
                emoji: "👠",
                label: "Talons hauts",
                note: "Pas adapté à Bali",
                kind: "bad"
              },
              {
                emoji: "🛁",
                label: "Grande serviette",
                note: "Trop lourde & volumineuse",
                kind: "bad"
              },
              {
                emoji: "🔌",
                label: "Adaptateur",
                note: "Prises compatibles FR/ID",
                kind: "bad"
              },
              {
                emoji: "☂️",
                label: "Parapluie",
                note: "K-way bien plus pratique",
                kind: "bad"
              },
              {
                emoji: "📦",
                label: "\"Au cas où\"",
                note: "Tu porteras juste plus lourd",
                kind: "bad"
              }
            ]
          }
        ]
      }
    ]
  },
  {
    key: "sante",
    title: "🏥 Santé",
    intro: "Quelques précautions simples pour voyager l'esprit tranquille.",
    blocks: [
      {
        ico: "🛡️",
        title: "Assurance voyage",
        content: [
          {
            type: "p",
            text: "Vérifie ce que ta carte bancaire couvre (rapatriement, frais d'hospitalisation). Si c'est insuffisant, une **assurance dédiée est recommandée**."
          },
          {
            type: "tags",
            items: [
              "Chapka",
              "Heymondo",
              "ACS"
            ]
          }
        ]
      },
      {
        ico: "💉",
        title: "Vaccins",
        content: [
          {
            type: "p",
            text: "**Aucun vaccin n'est obligatoire** pour entrer en Indonésie."
          },
          {
            type: "p",
            text: "Fais le point avec ton médecin traitant avant le départ selon ton dossier médical."
          }
        ]
      },
      {
        ico: "🎒",
        title: "Trousse médicale",
        content: [
          {
            type: "tags",
            items: [
              "Doliprane",
              "Spasfon",
              "Antidiarrhéique",
              "Crème solaire",
              "Anti-moustique",
              "Désinfectant"
            ]
          },
          {
            type: "p",
            text: "Ordonnance obligatoire pour les traitements spécifiques. Nombreuses pharmacies sur place pour les médicaments de base."
          }
        ]
      },
      {
        ico: "🍽️",
        title: "Alimentation & eau",
        content: [
          {
            type: "list",
            items: [
              "**Eau :** évite celle du robinet (non potable), privilégie l'eau en bouteille.",
              "**Glaçons :** généralement sans problème, fabriqués industriellement.",
              "**Crudités :** attention à celles non épluchées ou mal lavées.",
              "**Viande & poisson :** privilégie les aliments bien cuits.",
              "**Street food :** si tu as un ventre fragile, vas-y progressivement les premiers jours."
            ]
          }
        ]
      }
    ]
  },
  {
    key: "urgence",
    title: "🚨 Urgence",
    intro: "À garder sous la main au cas où.",
    blocks: [
      {
        ico: "🚑",
        title: "Numéros d'urgence",
        content: [
          {
            type: "p",
            text: "⚠️ **Coût des appels :** depuis une SIM française, des frais internationaux s'appliquent. Depuis une **SIM locale indonésienne**, les appels sont gratuits ou quasi-gratuits."
          },
          {
            type: "link",
            url: "tel:110",
            label: "🚔 Police — 110"
          },
          {
            type: "link",
            url: "tel:112",
            label: "🚑 Ambulance — 112"
          },
          {
            type: "link",
            url: "tel:113",
            label: "🚒 Pompiers — 113"
          },
          {
            type: "link",
            url: "tel:+622123557600",
            label: "🇫🇷 Ambassade de France à Jakarta"
          },
          {
            type: "p",
            text: "Ces numéros ne fonctionnent **pas sur WhatsApp** — appel classique uniquement."
          }
        ]
      },
      {
        ico: "🏥",
        title: "Cliniques — Denpasar",
        content: [
          {
            type: "link",
            url: "tel:+62361484748",
            label: "🏥 Bali Méd Hospital — +62 361 484748"
          },
          {
            type: "link",
            url: "tel:+62361761263",
            label: "🏥 BIMC Denpasar — +62 361 761 263"
          }
        ]
      },
      {
        ico: "🏥",
        title: "Cliniques — Ubud",
        content: [
          {
            type: "link",
            url: "tel:+6282298298911",
            label: "🏥 Unicare Clinic (24h) — +62 822 9829 8911"
          },
          {
            type: "link",
            url: "tel:+62361209103",
            label: "🏥 BIMC Ubud — +62 361 209 1030"
          }
        ]
      },
      {
        ico: "🏥",
        title: "Cliniques — Kuta / Canggu",
        content: [
          {
            type: "link",
            url: "tel:+62361779911",
            label: "🏥 Siloam Kuta — +62 361 779911"
          },
          {
            type: "link",
            url: "tel:+62361761263",
            label: "🏥 BIMC Kuta — +62 361 761263"
          }
        ]
      },
      {
        ico: "🏥",
        title: "Cliniques — Nusa Dua",
        content: [
          {
            type: "link",
            url: "tel:+62361300911",
            label: "🏥 BIMC Nusa Dua — +62 361 300 911"
          }
        ]
      },
      {
        ico: "🏥",
        title: "Cliniques — Amed / Sidemen",
        content: [
          {
            type: "p",
            text: "**Amed**"
          },
          {
            type: "link",
            url: "tel:+6236323445",
            label: "🏥 Klinik Pratama Amed — +62 363 23445"
          },
          {
            type: "p",
            text: "**Sidemen**"
          },
          {
            type: "link",
            url: "tel:+6236621440",
            label: "🏥 RSUD Klungkung — +62 366 21440"
          }
        ]
      },
      {
        ico: "💡",
        title: "Conseil",
        content: [
          {
            type: "p",
            text: "Les assurances demandent souvent à être **appelées avant un soin**. Elles peuvent te guider vers une clinique partenaire et faciliter la prise en charge directe."
          }
        ]
      }
    ]
  }
];
```

## FICHIER : src/index.css

```css
@import url("https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap");

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 60 9% 98%;
    --foreground: 0 0% 7%;
    --muted: 0 0% 95%;
    --muted-foreground: 0 0% 50%;
    --popover: 0 0% 100%;
    --popover-foreground: 0 0% 7%;
    --border: 0 0% 91%;
    --input: 0 0% 91%;
    --card: 0 0% 100%;
    --card-foreground: 0 0% 7%;
    --primary: 164 61% 26%;
    --primary-foreground: 0 0% 100%;
    --secondary: 0 0% 96%;
    --secondary-foreground: 0 0% 20%;
    --accent: 164 40% 93%;
    --accent-foreground: 164 61% 18%;
    --destructive: 0 84% 60%;
    --destructive-foreground: 0 0% 100%;
    --ring: 164 61% 26%;
    --radius: 0.75rem;
    --font-sans: "Inter", "Helvetica Neue", sans-serif;
    --font-mono: "Courier New", monospace;
  }

  * {
    @apply border-border;
  }

  body {
    @apply bg-background text-foreground font-sans antialiased;
  }
}
```

## FICHIER : tailwind.config.ts

```ts
import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: { sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"] },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: { DEFAULT: "hsl(var(--card))", foreground: "hsl(var(--card-foreground))" },
        popover: { DEFAULT: "hsl(var(--popover))", foreground: "hsl(var(--popover-foreground))" },
        primary: { DEFAULT: "hsl(var(--primary))", foreground: "hsl(var(--primary-foreground))" },
        secondary: { DEFAULT: "hsl(var(--secondary))", foreground: "hsl(var(--secondary-foreground))" },
        muted: { DEFAULT: "hsl(var(--muted))", foreground: "hsl(var(--muted-foreground))" },
        accent: { DEFAULT: "hsl(var(--accent))", foreground: "hsl(var(--accent-foreground))" },
        destructive: { DEFAULT: "hsl(var(--destructive))", foreground: "hsl(var(--destructive-foreground))" },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
```

## WORKFLOWS BACKEND À CRÉER

Table `users` : email (liste blanche, pré-remplie), passwordHash, firstName, sessionToken, resetToken, resetExpiresAt.
Table `checklist` : userId, checkedItems (tableau d'index numériques).

| Workflow | Entrée | Sortie |
|---|---|---|
| `authCheckEmail` | `{ email }` | `{ status: "not_found" / "no_password" / "has_password" }` |
| `authSetPassword` | `{ email, password }` | `{ userId, firstName, sessionToken }` (hash le mot de passe, génère un token) |
| `authLogin` | `{ email, password }` | `{ userId, firstName, sessionToken }` ou erreur "Email ou mot de passe incorrect" |
| `authForgotPassword` | `{ email }` | envoie un email avec lien `<url-app>?reset=<token>` valable 1 h ; répond toujours `{ ok: true }` |
| `authResetPassword` | `{ resetToken, newPassword }` | `{ email, userId, firstName, sessionToken }` |
| `authVerifySession` | `{ sessionToken }` | `{ valid, email, userId, firstName }` |
| `getChecklist` | `{ sessionToken }` | `{ checkedItems: number[] }` (tableau vide si rien) |
| `updateChecklist` | `{ sessionToken, checkedItems: number[] }` | `{ ok: true }` |

Dans `src/api/workflows.ts`, remplace l'appel `fetch` par le client workflow fourni par Zite si tu en as un.
