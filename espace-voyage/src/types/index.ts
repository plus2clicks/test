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
