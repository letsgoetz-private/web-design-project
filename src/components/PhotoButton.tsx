import type { MouseEventHandler } from "react";
import { ExpandMark } from "./ExpandMark";
import { imageSources, imageUrl } from "../site/utils";
import type { Photograph, Study } from "../portfolio/types";

type PhotoButtonArgs = {
  study: Study;
  photo: Photograph;
  hidden: boolean;
  onOpen: MouseEventHandler<HTMLButtonElement>;
};

export const PhotoButton = ({ study, photo, hidden, onOpen }: PhotoButtonArgs) => {
  return (
    <button
      className="photo-button"
      data-study-id={study.id}
      aria-label={`Come closer: ${study.id === "touch" ? "the plated dish" : study.label.toLowerCase()}`}
      onClick={onOpen}
    >
      <span className="photo-window" style={{ visibility: hidden ? "hidden" : undefined }}>
        <img
          src={imageUrl(photo.image)}
          srcSet={imageSources(photo.image)}
          sizes="(max-width: 760px) min(86vw, 45svh), min(39vw, 490px, 45svh)"
          decoding="async"
          alt={photo.alt}
          loading={study.id === "touch" ? "eager" : "lazy"}
        />
      </span>
      <span className="photo-caption">
        <ExpandMark />
        <span>Come closer</span>
      </span>
    </button>
  );
};
