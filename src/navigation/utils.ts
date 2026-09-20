import { SECTION_TOLERANCE } from "./consts";

type SectionGeometry = { target: number; height: number; bottom: number };

const TALL_SECTION_TOLERANCE = 8;

type sectionTargetArgs = {
  top: number;
  scrollY: number;
  headerHeight: number;
  pageHeight: number;
  viewportHeight: number;
};

export const sectionTarget = ({
  top,
  scrollY,
  headerHeight,
  pageHeight,
  viewportHeight,
}: sectionTargetArgs): number => {
  return Math.max(0, Math.min(top + scrollY - headerHeight, pageHeight - viewportHeight));
};

type neighbouringSectionArgs = {
  sections: SectionGeometry[];
  direction: number;
  scrollY: number;
  viewportHeight: number;
  headerHeight: number;
};

// null preserves native scrolling through unread content; undefined consumes an end-of-page gesture.
export const neighbouringSection = ({
  sections,
  direction,
  scrollY,
  viewportHeight,
  headerHeight,
}: neighbouringSectionArgs): number | null | undefined => {
  const reverse = sections.map((section, index) => ({ ...section, index })).reverse();
  const current =
    reverse.find((section) => section.target <= scrollY + SECTION_TOLERANCE) ?? sections[0];
  if (!current) return undefined;
  if (current.height > viewportHeight - headerHeight + TALL_SECTION_TOLERANCE) {
    if (direction > 0 && current.bottom > viewportHeight + SECTION_TOLERANCE) return null;
    if (direction < 0 && scrollY > current.target + SECTION_TOLERANCE) return null;
  }
  if (direction < 0)
    return reverse.find((section) => section.target < scrollY - SECTION_TOLERANCE)?.index;
  const next = sections.findIndex((section) => section.target > scrollY + SECTION_TOLERANCE);
  return next === -1 ? undefined : next;
};

export const wheelDistance = (delta: number, mode: number, viewportHeight: number): number => {
  return Math.abs(delta) * (mode === 1 ? 16 : mode === 2 ? viewportHeight : 1);
};

export const keyDirection = (key: string, shift: boolean): number => {
  if (key === "ArrowDown" || key === "PageDown" || (key === " " && !shift)) return 1;
  if (key === "ArrowUp" || key === "PageUp" || (key === " " && shift)) return -1;
  return 0;
};
