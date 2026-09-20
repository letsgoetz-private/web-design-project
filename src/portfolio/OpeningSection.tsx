import type { MouseEventHandler } from "react";
import { PhotoButton } from "../components/PhotoButton";
import { SectionNavigation } from "../components/SectionNavigation";
import { opening } from "./consts";

type OpeningSectionArgs = { hidden: boolean; onOpen: MouseEventHandler<HTMLButtonElement> };

export const OpeningSection = ({ hidden, onOpen }: OpeningSectionArgs) => {
  return (
    <section className="encounter first" id="opening" aria-labelledby="touch-title">
      <div className="thought">
        <h1 id="touch-title">
          When does
          <br />
          looking become
          <br />
          <span className="wanting">wanting?</span>
        </h1>
      </div>
      <div className="picture">
        <PhotoButton study={opening} photo={opening} hidden={hidden} onOpen={onOpen} />
      </div>
      <SectionNavigation
        label="Continue from the opening"
        links={[{ href: "#colour", label: "More color", direction: "down" }]}
      />
    </section>
  );
};
