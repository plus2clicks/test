import { useState } from "react";
import { Eye, EyeOff, LoaderCircle } from "lucide-react";
import { useCustomAuth } from "../contexts/AuthContext";
import {
  authCheckEmail,
  authSetPassword,
  authLogin,
  authForgotPassword,
  authResetPassword,
} from "zitejs/api";

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
