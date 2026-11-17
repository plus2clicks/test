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
