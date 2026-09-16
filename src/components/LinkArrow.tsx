import { arrowPaths } from "./consts";

type LinkArrowArgs = { direction?: keyof typeof arrowPaths };

export function LinkArrow({ direction = "up-right" }: LinkArrowArgs) {
  return (
    <svg className="link-arrow" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d={arrowPaths[direction]} stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}
