import { useEffect, useRef, useState } from "react";
import { useCustomAuth } from "../contexts/AuthContext";
import { getChecklist } from "zitejs/api";
import { DASHBOARD_TILES, CHECKLIST_ITEMS } from "../data/content";

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
