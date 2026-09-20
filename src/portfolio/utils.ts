import { opening } from "./consts";
import type { PortfolioState, Study, StudySectionModel } from "./types";

const studies: Study[] = [
  {
    id: "colour",
    label: "Anticipation",
    category: "Colour",
    number: "01",
    image: "timo-03.jpg",
    alt: "A vivid pink rose-shaped composition surrounded by pale pink sauce and a ring of small pearls.",
    thought: "You haven’t tasted it yet…",
    reveal: "…but you can almost feel it on your tongue.",
    gallery: [
      {
        image: "timo-03.jpg",
        alt: "Vivid pink rose-shaped composition with pearl details on a white plate.",
      },
      { image: "timo-04.jpg", alt: "A tall pink and orange cylindrical composition." },
      { image: "timo-10.jpg", alt: "A pink circular composition with purple flowers." },
      {
        image: "timo-14.jpg",
        alt: "A yellow sphere surrounded by red and white rings and caviar.",
      },
    ],
  },
  {
    id: "structure",
    label: "Bite",
    category: "Structure",
    number: "02",
    image: "timo-12.jpg",
    alt: "A thin golden lattice resting over glossy dark caviar in a triangular shell.",
    thought: "You haven’t touched it…",
    reveal: "…but you’re already imagining the first bite.",
    gallery: [
      { image: "timo-12.jpg", alt: "A triangular caviar tart with a delicate golden lattice." },
      {
        image: "timo-01.jpg",
        alt: "A circular saffron-coloured composition finished with caviar.",
      },
      { image: "timo-08.jpg", alt: "A green and black double-ring composition with caviar." },
      {
        image: "timo-11.jpg",
        alt: "A thin black lattice over a yellow, seed-coated circular composition.",
      },
    ],
  },
  {
    id: "plate",
    label: "Plate",
    category: "Plate",
    number: "03",
    image: "timo-05.jpg",
    alt: "A red prawn, green courgette and pale foam with a generous expanse of white plate.",
    thought: "Sometimes people want more on the plate…",
    reveal: "…but sometimes we need more plate.",
    gallery: [
      { image: "timo-05.jpg", alt: "A red prawn and courgette composition with a wide white rim." },
      { image: "timo-09.jpg", alt: "A white tart with colourful fruit and blue flowers." },
      {
        image: "timo-15.jpg",
        alt: "A layered composition in salmon and tomato tones, topped with caviar.",
      },
      {
        image: "timo-02.jpg",
        alt: "Seared meat, vegetables and green oil framed by a white plate.",
      },
    ],
  },
];

const sectionLinks: Record<string, string> = {
  colour: "More color",
  structure: "More structure",
  plate: "More space",
};

export const findStudy = (id: string | null): Study | undefined => {
  return id === opening.id ? opening : studies.find((study) => study.id === id);
};

const selectedPhotograph = (study: Study, selectedImages: PortfolioState["selectedImages"]) => {
  return study.gallery[selectedImages[study.id] ?? 0] ?? study;
};

export const buildStudySections = (state: PortfolioState): StudySectionModel[] => {
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
};
