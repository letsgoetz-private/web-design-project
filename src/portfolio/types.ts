export type Photograph = { image: string; alt: string };
export type Study = Photograph & {
  id: string;
  label: string;
  category: string;
  thought: string;
  reveal: string;
  number: string;
  gallery: Photograph[];
};

export type PortfolioState = {
  activeId: string | null;
  phase: "closed" | "opening" | "open" | "closing";
  selectedImages: Record<string, number>;
};

export type PortfolioAction =
  | { type: "open"; studyId: string }
  | { type: "expanded" }
  | { type: "select"; studyId: string; index: number }
  | { type: "close" }
  | { type: "closed" };

export type SectionLink = { href: string; label: string; direction: "up" | "down" };

export type StudySectionModel = {
  study: Study;
  photo: Photograph;
  hidden: boolean;
  reverse: boolean;
  links: SectionLink[];
};
