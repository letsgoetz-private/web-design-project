import { useEffect } from "react";
import { attachSectionScroll } from "./sectionScroll";

export const useSectionScroll = (paused: boolean) => {
  useEffect(() => {
    if (!paused) return attachSectionScroll();
  }, [paused]);
};
