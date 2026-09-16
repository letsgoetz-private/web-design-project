export type Rectangle = { left: number; top: number; width: number; height: number };
export type Point = { x: number; y: number };
export type PointerGesture = Point & { id: number };
export type SelectPhotograph = (studyId: string, index: number) => void;
export type Thumbnail = { image: string; index: number; selected: boolean; label: string };
