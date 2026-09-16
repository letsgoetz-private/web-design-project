import { opening, sectionLinks, studies } from "./consts";
import type { PortfolioState, Study, StudySectionModel } from "./types";

export function findStudy(id: string | null): Study | undefined {
  return id === opening.id ? opening : studies.find((study) => study.id === id);
}

export function selectedPhotograph(study: Study, selectedImages: PortfolioState["selectedImages"]) {
  return study.gallery[selectedImages[study.id] ?? 0] ?? study;
}

export function buildStudySections(state: PortfolioState): StudySectionModel[] {
  return studies.map((study, index) => ({
    study,
    photo: selectedPhotograph(study, state.selectedImages),
    hidden: study.id === state.activeId,
    reverse: index % 2 === 1,
    links: [
      {
        href: `#${index === 0 ? "opening" : studies[index - 1].id}`,
        label: index === 0 ? "Back to the start" : sectionLinks[studies[index - 1].id],
        direction: "up",
      },
      {
        href: `#${studies[index + 1]?.id ?? "kitchen"}`,
        label: studies[index + 1] ? sectionLinks[studies[index + 1].id] : "To the kitchen",
        direction: "down",
      },
    ],
  }));
}
