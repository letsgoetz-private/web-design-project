import type { MouseEventHandler } from "react";

type GalleryEdgeArgs = {
  direction: "previous" | "next";
  category: string;
  disabled: boolean;
  onClick: MouseEventHandler<HTMLButtonElement>;
};

export const GalleryEdge = ({ direction, category, disabled, onClick }: GalleryEdgeArgs) => {
  const label = direction === "previous" ? "Previous" : "Next";
  return (
    <button
      className={`gallery-edge gallery-${direction} gallery-controls`}
      disabled={disabled}
      onClick={onClick}
      aria-label={`${label} ${category.toLowerCase()} photograph`}
    >
      <svg className="gallery-chevron" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path
          d={direction === "previous" ? "m12 4-6 6 6 6" : "m8 4 6 6-6 6"}
          stroke="currentColor"
          strokeWidth="1.4"
        />
      </svg>
    </button>
  );
};
