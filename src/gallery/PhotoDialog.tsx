import type { RefObject, MouseEvent, SyntheticEvent } from "react";
import { LinkArrow } from "../components/LinkArrow";
import { StudyGallery } from "./StudyGallery";
import { ThoughtReveal } from "./ThoughtReveal";
import type { Study, PortfolioState } from "../portfolio/types";
import type { SelectPhotograph } from "./types";
import { imageUrl } from "../site/utils";

type PhotoDialogArgs = {
  study: Study | undefined;
  index: number;
  phase: PortfolioState["phase"];
  dialogRef: RefObject<HTMLDialogElement | null>;
  frameRef: RefObject<HTMLDivElement | null>;
  onSelect: SelectPhotograph;
  onClose: () => Promise<void>;
};
export function PhotoDialog({
  study,
  index,
  phase,
  dialogRef,
  frameRef,
  onSelect,
  onClose,
}: PhotoDialogArgs) {
  function handleCancel(event: SyntheticEvent<HTMLDialogElement>) {
    event.preventDefault();
    void onClose();
  }
  function handleOutsideClick(event: MouseEvent<HTMLDialogElement>) {
    if (
      !(event.target as Element).closest("[data-gallery-photo],.gallery-edge,.gallery-thumbnails")
    )
      void onClose();
  }
  const hasGallery = Boolean(study?.gallery.length);
  return (
    <dialog
      ref={dialogRef}
      className={`detail${hasGallery ? " has-gallery" : ""}${phase === "closing" ? " closing" : ""}`}
      aria-labelledby="detail-title"
      onCancel={handleCancel}
      onClick={handleOutsideClick}
    >
      {study && (
        <>
          <button className="close" autoFocus aria-label="Close photograph">
            Back <LinkArrow direction="left" />
          </button>
          <div className={`detail-layout ${hasGallery ? "with-gallery" : "image-only"}`}>
            {hasGallery ? (
              <StudyGallery
                key={study.id}
                study={study}
                index={index}
                onSelect={onSelect}
                frameRef={frameRef}
                disabled={phase !== "open"}
              />
            ) : (
              <div ref={frameRef} className="detail-photo" data-gallery-photo>
                <img src={imageUrl(study.image)} alt={study.alt} />
              </div>
            )}
            <ThoughtReveal study={study} />
          </div>
        </>
      )}
    </dialog>
  );
}
