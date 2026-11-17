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
