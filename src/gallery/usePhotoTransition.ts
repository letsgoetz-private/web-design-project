import { useCallback, useLayoutEffect, useRef, type Dispatch } from "react";
import { flushSync } from "react-dom";

import { photographTransform } from "./utils";
import type { PortfolioAction } from "../portfolio/types";

const EXPANSION_DURATION = 880;
const EXPANSION_EASING = "cubic-bezier(.16,1,.3,1)";
const BRIGHTEN_DURATION = 360;

const motionDuration = (duration: number, reducedMotion: boolean): number =>
  reducedMotion ? 0 : duration;

type usePhotoTransitionArgs = { activeId: string | null; dispatch: Dispatch<PortfolioAction> };

// Refs hold browser resources only. Visible phase and selection belong to the React reducer.
export const usePhotoTransition = ({ activeId, dispatch }: usePhotoTransitionArgs) => {
  const dialog = useRef<HTMLDialogElement>(null);
  const enlarged = useRef<HTMLDivElement>(null);
  const origin = useRef<HTMLImageElement | null>(null);
  const unlockScroll = useRef<(() => void) | null>(null);
  const returning = useRef(false);
  const pageScroll = useRef(0);

  useLayoutEffect(() => {
    if (!activeId || !dialog.current || !enlarged.current || !origin.current) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const surface = dialog.current;
    const image = enlarged.current;
    const source = origin.current;
    // Keep the already-decoded page image underneath while the original loads.
    image.style.backgroundImage = `url("${source.currentSrc || source.src}")`;
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
      {
        duration: motionDuration(EXPANSION_DURATION, reducedMotion),
        easing: EXPANSION_EASING,
        fill: "both",
      },
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
        duration: motionDuration(BRIGHTEN_DURATION, reducedMotion),
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
      image.style.removeProperty("background-image");
      surface.close();
    };
  }, [activeId, dispatch]);

  const close = useCallback(async () => {
    if (returning.current || !enlarged.current || !origin.current) return;
    returning.current = true;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Restore the scrollbar before measuring the landing, while the page is hidden.
    unlockScroll.current?.();
    unlockScroll.current = null;
    window.scrollTo({ top: pageScroll.current, behavior: "instant" });
    const image = enlarged.current;
    const source = origin.current;
    const currentStyle = getComputedStyle(image);
    const landingReady = source.decode().catch(() => undefined);
    const transform = currentStyle.transform;
    const filter = currentStyle.filter;
    image.getAnimations().forEach((animation) => animation.cancel());
    const start = image.getBoundingClientRect();
    const end = source.getBoundingClientRect();
    flushSync(() => dispatch({ type: "close" }));
    try {
      const landing = image.animate(
        [
          { transform, filter },
          { transform: photographTransform(start, end), filter: getComputedStyle(source).filter },
        ],
        {
          duration: motionDuration(EXPANSION_DURATION, reducedMotion),
          easing: EXPANSION_EASING,
          fill: "forwards",
        },
      );
      // Keep the settled gallery frame covering the page until its smaller
      // replacement has decoded, including on a slow connection.
      await Promise.all([landing.finished, landingReady]);
      // The page photo already holds the selection. Restore it in the same paint.
      flushSync(() => dispatch({ type: "closed" }));
    } catch {
      /* Unmounting cancels the browser animation. */
    } finally {
      returning.current = false;
    }
  }, [dispatch]);

  const open = useCallback(
    (studyId: string, source: HTMLImageElement | null) => {
      origin.current = source;
      dispatch({ type: "open", studyId });
    },
    [dispatch],
  );

  return { dialog, enlarged, open, close };
};
