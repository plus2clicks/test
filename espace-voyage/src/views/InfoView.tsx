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
