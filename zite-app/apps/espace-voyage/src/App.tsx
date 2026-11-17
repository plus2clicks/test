import { AuthProvider, useCustomAuth } from "./contexts/AuthContext";
import { LoginView } from "./views/LoginView";
import { MainApp } from "./views/MainApp";

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
