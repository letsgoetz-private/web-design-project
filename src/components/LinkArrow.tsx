const arrowPaths = {
  "up-right": "M4 16 16 4M5 4h11v11",
  down: "M10 3v14M4 11l6 6 6-6",
  up: "M10 17V3M4 9l6-6 6 6",
  left: "M17 10H3M9 4l-6 6 6 6",
};

type LinkArrowArgs = { direction?: keyof typeof arrowPaths };

export const LinkArrow = ({ direction = "up-right" }: LinkArrowArgs) => {
  return (
    <svg className="link-arrow" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d={arrowPaths[direction]} stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
};
