import { DRAG_THRESHOLD, SWIPE_AXIS_RATIO, SWIPE_THRESHOLD } from "./consts";
import type { Point, Rectangle, Thumbnail } from "./types";
import type { Study } from "../portfolio/types";

export function photographTransform(from: Rectangle, to: Rectangle): string {
  return `translate(${to.left - from.left}px, ${to.top - from.top}px) scale(${to.width / from.width}, ${to.height / from.height})`;
}
export function wrapIndex(index: number, length: number): number {
  return ((index % length) + length) % length;
}
export function isDrag(start: Point, end: Point): boolean {
  return Math.hypot(end.x - start.x, end.y - start.y) > DRAG_THRESHOLD;
}
export function swipeDirection(start: Point, end: Point): number {
  const x = end.x - start.x;
  const y = end.y - start.y;
  return Math.abs(x) > SWIPE_THRESHOLD && Math.abs(x) > Math.abs(y) * SWIPE_AXIS_RATIO
    ? x < 0
      ? 1
      : -1
    : 0;
}
export function trailingSpace(height: number, footerTop: number, footerHeight: number): number {
  return Math.max(0, height - footerTop - footerHeight);
}
export function buildThumbnails(study: Study, selectedIndex: number): Thumbnail[] {
  return study.gallery.map((photo, index) => ({
    image: photo.image,
    index,
    selected: index === selectedIndex,
    label: `View ${study.category.toLowerCase()} photograph ${index + 1}`,
  }));
}
export function photographCount(index: number, total: number): string {
  return `${String(index + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}`;
}
