import { useCallback, useReducer, type MouseEvent } from "react";
import { Header } from "../components/Header";
import { PhotoDialog } from "../gallery/PhotoDialog";
import { usePhotoTransition } from "../gallery/usePhotoTransition";
import { useSectionScroll } from "../navigation/useSectionScroll";
import { ClosingSection } from "./ClosingSection";
import { OpeningSection } from "./OpeningSection";
import { StudySection } from "./StudySection";
import { buildStudySections, findStudy } from "./utils";
import { initialPortfolioState, portfolioReducer } from "./reducer";

export function PortfolioPage() {
  const [state, dispatch] = useReducer(portfolioReducer, initialPortfolioState);
  const transition = usePhotoTransition({ activeId: state.activeId, dispatch });
  useSectionScroll(state.phase !== "closed");
  const active = findStudy(state.activeId);
  const sections = buildStudySections(state);

  function openPhotograph(event: MouseEvent<HTMLButtonElement>) {
    const studyId = event.currentTarget.dataset.studyId;
    if (!studyId || !findStudy(studyId)) return;
    transition.open(studyId, event.currentTarget.querySelector("img"));
  }
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
}
