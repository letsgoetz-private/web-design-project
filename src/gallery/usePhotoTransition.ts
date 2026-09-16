import { useLayoutEffect, useRef, type Dispatch } from "react";
import { flushSync } from "react-dom";
import { BRIGHTEN_DURATION, EXPANSION_DURATION, EXPANSION_EASING } from "./consts";
import { photographTransform } from "./utils";
import type { PortfolioAction } from "../portfolio/types";

function motionDuration(duration: number): number {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : duration;
}

type usePhotoTransitionArgs = { activeId: string | null; dispatch: Dispatch<PortfolioAction> };

// Refs hold browser resources only. Visible phase and selection belong to the React reducer.
export function usePhotoTransition({ activeId, dispatch }: usePhotoTransitionArgs) {
  const dialog = useRef<HTMLDialogElement>(null);
  const enlarged = useRef<HTMLDivElement>(null);
  const origin = useRef<HTMLImageElement | null>(null);
  const unlockScroll = useRef<(() => void) | null>(null);
  const returning = useRef(false);
  const pageScroll = useRef(0);

  useLayoutEffect(() => {
    if (!activeId || !dialog.current || !enlarged.current || !origin.current) return;
    const surface = dialog.current;
    const image = enlarged.current;
    const source = origin.current;
    pageScroll.current = window.scrollY;
    const start = source.getBoundingClientRect();
    surface.showModal();
    surface.scrollTop = 0;
    const root = document.documentElement;
    const previousOverflow = root.style.overflow;
    root.style.overflow = "hidden";
    unlockScroll.current = () => {
      root.style.overflow = previousOverflow;
    };
    const end = image.getBoundingClientRect();
    let cancelled = false;
    const expansion = image.animate(
      [{ transform: photographTransform(end, start) }, { transform: "none" }],
      { duration: motionDuration(EXPANSION_DURATION), easing: EXPANSION_EASING, fill: "both" },
    );
    void expansion.finished
      .then(() => {
        if (!cancelled && !returning.current) dispatch({ type: "expanded" });
      })
      .catch(() => {
        /* Closing can interrupt expansion. */
      });
    const brightening = image.animate(
      [{ filter: getComputedStyle(source).filter }, { filter: "brightness(1)" }],
      {
        duration: motionDuration(BRIGHTEN_DURATION),
        easing: "ease-out",
        fill: "both",
      },
    );
    void brightening.finished.catch(() => {
      // Returning can interrupt brightening before its final frame.
    });
    return () => {
      cancelled = true;
      unlockScroll.current?.();
      unlockScroll.current = null;
      image.getAnimations().forEach((animation) => animation.cancel());
      surface.close();
    };
  }, [activeId, dispatch]);

  async function close() {
    if (returning.current || !enlarged.current || !origin.current) return;
    returning.current = true;
    // Restore the scrollbar before measuring the landing, while the page is hidden.
    unlockScroll.current?.();
    unlockScroll.current = null;
    window.scrollTo({ top: pageScroll.current, behavior: "instant" });
    const image = enlarged.current;
    const source = origin.current;
    const currentStyle = getComputedStyle(image);
    const transform = currentStyle.transform;
    const filter = currentStyle.filter;
    image.getAnimations().forEach((animation) => animation.cancel());
    const start = image.getBoundingClientRect();
    const end = source.getBoundingClientRect();
    flushSync(() => dispatch({ type: "close" }));
    try {
      await image.animate(
        [
          { transform, filter },
          { transform: photographTransform(start, end), filter: getComputedStyle(source).filter },
        ],
        {
          duration: motionDuration(EXPANSION_DURATION),
          easing: EXPANSION_EASING,
          fill: "forwards",
        },
      ).finished;
      // The page photo already holds the selection. Restore it in the same paint.
      flushSync(() => dispatch({ type: "closed" }));
    } catch {
      /* Unmounting cancels the browser animation. */
    } finally {
      returning.current = false;
    }
  }

  function open(studyId: string, source: HTMLImageElement | null) {
    origin.current = source;
    dispatch({ type: "open", studyId });
  }

  return { dialog, enlarged, open, close };
}
