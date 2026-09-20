import type { MouseEventHandler } from "react";
import { PhotoButton } from "../components/PhotoButton";
import { SectionNavigation } from "../components/SectionNavigation";
import type { StudySectionModel } from "./types";

type StudySectionArgs = StudySectionModel & { onOpen: MouseEventHandler<HTMLButtonElement> };

export const StudySection = ({
  study,
  photo,
  hidden,
  reverse,
  links,
  onOpen,
}: StudySectionArgs) => {
  return (
    <section
      className={`encounter second chapter${reverse ? " reverse" : ""}`}
      id={study.id}
      aria-labelledby={`${study.id}-title`}
    >
      <div className="thought">
        <span className="index">
          {study.number} / {study.label}
        </span>
        <h2 id={`${study.id}-title`}>{study.thought}</h2>
      </div>
      <div className="picture">
        <PhotoButton study={study} photo={photo} hidden={hidden} onOpen={onOpen} />
      </div>
      <SectionNavigation label={`Navigate from ${study.label.toLowerCase()}`} links={links} />
    </section>
  );
};
