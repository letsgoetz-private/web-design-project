import type { Study } from "../portfolio/types";
type ThoughtRevealArgs = { study: Study };
export const ThoughtReveal = ({ study }: ThoughtRevealArgs) => {
  if (!study.reveal)
    return (
      <h2 id="detail-title" className="sr-only">
        The plated dish, a closer look
      </h2>
    );
  return (
    <div className="revelation">
      <span className="index">
        {study.number} / {study.label}
      </span>
      <p className="remembered">{study.thought}</p>
      <h2 id="detail-title">{study.reveal}</h2>
    </div>
  );
};
