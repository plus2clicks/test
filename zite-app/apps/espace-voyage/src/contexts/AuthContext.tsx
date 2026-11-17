import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { authVerifySession } from "zitejs/api";
import type { AuthUser } from "../types";

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
