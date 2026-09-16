import { useEffect } from "react";
import { attachSectionScroll } from "./sectionScroll";

export function useSectionScroll(paused: boolean) {
  useEffect(() => {
    if (!paused) return attachSectionScroll();
  }, [paused]);
}
