import { useCallback, useReducer, type MouseEvent } from "react";
import { Header } from "../components/Header";
import { PhotoDialog } from "../gallery/PhotoDialog";
import { usePhotoTransition } from "../gallery/usePhotoTransition";
import { useSectionScroll } from "../navigation/useSectionScroll";
import { ClosingSection } from "./ClosingSection";
import { OpeningSection } from "./OpeningSection";
import { StudySection } from "./StudySection";
import { buildStudySections, findStudy } from "./utils";
import type { PortfolioAction, PortfolioState } from "./types";

const initialPortfolioState: PortfolioState = {
  activeId: null,
  phase: "closed",
  selectedImages: {},
};

const portfolioReducer = (state: PortfolioState, action: PortfolioAction): PortfolioState => {
  switch (action.type) {
    case "open":
      return state.phase === "closed"
        ? { ...state, activeId: action.studyId, phase: "opening" }
        : state;
    case "expanded":
      return state.phase === "opening" ? { ...state, phase: "open" } : state;
    case "select":
      if (state.phase !== "open" || state.activeId !== action.studyId) return state;
      return {
        ...state,
        selectedImages: { ...state.selectedImages, [action.studyId]: action.index },
      };
    case "close":
      return state.phase === "closed" ? state : { ...state, phase: "closing" };
    case "closed":
      return { ...state, activeId: null, phase: "closed" };
  }
};

export const PortfolioPage = () => {
  const [state, dispatch] = useReducer(portfolioReducer, initialPortfolioState);
  const transition = usePhotoTransition({ activeId: state.activeId, dispatch });
  const { open } = transition;
  useSectionScroll(state.phase !== "closed");
  const active = findStudy(state.activeId);
  const sections = buildStudySections(state);

  const openPhotograph = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      const studyId = event.currentTarget.dataset.studyId;
      if (!studyId || !findStudy(studyId)) return;
      open(studyId, event.currentTarget.querySelector("img"));
    },
    [open],
  );
  const selectPhotograph = useCallback((studyId: string, index: number) => {
    dispatch({ type: "select", studyId, index });
  }, []);

  return (
    <>
      <div
        className={`page-content${active ? " obscured" : ""}${state.phase === "closing" ? " returning" : ""}`}
      >
        <a className="skip" href="#main">
          Skip to the food
        </a>
        <Header />
        <main id="main">
          <OpeningSection hidden={state.activeId === "touch"} onOpen={openPhotograph} />
          {sections.map((section) => (
            <StudySection key={section.study.id} {...section} onOpen={openPhotograph} />
          ))}
          <ClosingSection />
        </main>
      </div>
      <PhotoDialog
        study={active}
        index={state.selectedImages[state.activeId ?? ""] ?? 0}
        phase={state.phase}
        dialogRef={transition.dialog}
        frameRef={transition.enlarged}
        onSelect={selectPhotograph}
        onClose={transition.close}
      />
    </>
  );
};
