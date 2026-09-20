export type Point = { x: number; y: number };

export type SelectPhotograph = (studyId: string, index: number) => void;
export type Thumbnail = { image: string; index: number; selected: boolean; label: string };
