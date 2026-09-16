import { GESTURE_GAP, INTENT_DISTANCE, NAVIGATION_KEYS, TRAVEL_DURATION } from "./consts";
import {
  keyDirection,
  neighbouringSection,
  sectionTarget,
  travelProgress,
  wheelDistance,
} from "./utils";
import type { TouchGesture } from "./types";

// One deliberate gesture, one section. Tall sections remain freely scrollable.
export function attachSectionScroll() {
  const sections = Array.from(document.querySelectorAll<HTMLElement>(".encounter"));
  if (!sections.length) return;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  let frame = 0;
  let moving = false;
  let lastWheel = -Infinity;
  let wheelDirection = 0;
  let distance = 0;
  let consumed = false;
  let touch: TouchGesture | null = null;

  const blocked = () => Boolean(document.querySelector("dialog[open]"));
  const headerHeight = () => document.querySelector("header")?.getBoundingClientRect().height ?? 0;
  const targetY = (section: HTMLElement) =>
    sectionTarget({
      top: section.getBoundingClientRect().top,
      scrollY: window.scrollY,
      headerHeight: headerHeight(),
      pageHeight: document.documentElement.scrollHeight,
      viewportHeight: window.innerHeight,
    });
  const cancel = () => {
    cancelAnimationFrame(frame);
    moving = false;
  };

  function travel(section: HTMLElement, updateHash = true) {
    cancel();
    const start = window.scrollY;
    const finish = targetY(section);
    const complete = () => {
      moving = false;
      if (updateHash) history.replaceState(history.state, "", `#${section.id}`);
    };
    if (reduced.matches || Math.abs(finish - start) < 1) {
      window.scrollTo({ top: finish, behavior: "instant" });
      complete();
      return;
    }
    const began = performance.now();
    moving = true;
    const tick = (now: number) => {
      if (blocked()) {
        cancel();
        return;
      }
      const elapsed = now - began;
      // Smooth acceleration and a long, quiet landing; no snap at either end.
      const ease = travelProgress(elapsed, TRAVEL_DURATION);
      window.scrollTo({ top: start + (finish - start) * ease, behavior: "instant" });
      if (elapsed < TRAVEL_DURATION) frame = requestAnimationFrame(tick);
      else complete();
    };
    frame = requestAnimationFrame(tick);
  }

  function neighbour(direction: number): HTMLElement | null | undefined {
    const index = neighbouringSection({
      sections: sections.map((section) => {
        const rect = section.getBoundingClientRect();
        return { target: targetY(section), height: rect.height, bottom: rect.bottom };
      }),
      direction,
      scrollY: window.scrollY,
      viewportHeight: window.innerHeight,
      headerHeight: headerHeight(),
    });
    return index === null || index === undefined ? index : sections[index];
  }

  function onWheel(event: WheelEvent) {
    if (
      blocked() ||
      reduced.matches ||
      event.ctrlKey ||
      event.metaKey ||
      event.shiftKey ||
      Math.abs(event.deltaX) > Math.abs(event.deltaY) ||
      !event.deltaY
    )
      return;
    const direction = Math.sign(event.deltaY);
    const now = performance.now();
    const fresh = now - lastWheel > GESTURE_GAP;
    const changedDirection = direction !== wheelDirection;
    lastWheel = now;
    wheelDirection = direction;
    if (fresh) {
      distance = 0;
      consumed = false;
    } else if (changedDirection && !consumed) distance = 0;
    if (moving || consumed) {
      consumed = true;
      event.preventDefault();
      return;
    }
    const target = neighbour(direction);
    if (target === null) return;
    event.preventDefault();
    // Ignore the complete boundary gesture, including any reversed momentum.
    if (!target) {
      consumed = true;
      return;
    }
    distance += wheelDistance(event.deltaY, event.deltaMode, window.innerHeight);
    if (distance < INTENT_DISTANCE) return;
    consumed = true;
    travel(target);
  }

  function onTouchStart(event: TouchEvent) {
    if (blocked() || event.touches.length !== 1) {
      touch = null;
      return;
    }
    touch = { x: event.touches[0].clientX, y: event.touches[0].clientY, consumed: moving };
  }
  function onTouchMove(event: TouchEvent) {
    if (!touch || blocked() || reduced.matches || event.touches.length !== 1) return;
    if (moving || touch.consumed) {
      touch.consumed = true;
      event.preventDefault();
      return;
    }
    const dx = touch.x - event.touches[0].clientX;
    const dy = touch.y - event.touches[0].clientY;
    if (Math.abs(dx) > Math.abs(dy) || !dy) return;
    const target = neighbour(Math.sign(dy));
    if (target === null) return;
    event.preventDefault();
    if (!target) {
      touch.consumed = true;
      return;
    }
    if (Math.abs(dy) < INTENT_DISTANCE) return;
    touch.consumed = true;
    travel(target);
  }
  const endTouch = () => {
    touch = null;
  };

  function onClick(event: MouseEvent) {
    if (
      blocked() ||
      event.button !== 0 ||
      event.ctrlKey ||
      event.metaKey ||
      event.shiftKey ||
      event.altKey
    )
      return;
    const link = (event.target as Element).closest<HTMLAnchorElement>(".section-navigation a");
    const target = link && sections.find((section) => `#${section.id}` === link.hash);
    if (!link || !target) return;
    event.preventDefault();
    if (moving) return;
    if (location.hash !== link.hash) history.pushState(history.state, "", link.hash);
    travel(target, false);
  }
  function onKeyDown(event: KeyboardEvent) {
    if (event.key === "Escape") {
      cancel();
      return;
    }
    if (
      blocked() ||
      reduced.matches ||
      event.ctrlKey ||
      event.metaKey ||
      event.altKey ||
      (event.target as Element).closest("a,button,input,textarea,select,[contenteditable]")
    )
      return;
    if (moving && NAVIGATION_KEYS.includes(event.key)) {
      event.preventDefault();
      return;
    }
    const direction = keyDirection(event.key, event.shiftKey);
    if (!direction) return;
    const target = neighbour(direction);
    if (target === null) return;
    event.preventDefault();
    if (target) travel(target);
  }

  window.addEventListener("wheel", onWheel, { passive: false });
  window.addEventListener("touchstart", onTouchStart, { passive: true });
  window.addEventListener("touchmove", onTouchMove, { passive: false });
  window.addEventListener("touchend", endTouch);
  window.addEventListener("touchcancel", endTouch);
  window.addEventListener("click", onClick);
  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("resize", cancel);
  window.addEventListener("hashchange", cancel);
  reduced.addEventListener("change", cancel);
  return () => {
    cancel();
    window.removeEventListener("wheel", onWheel);
    window.removeEventListener("touchstart", onTouchStart);
    window.removeEventListener("touchmove", onTouchMove);
    window.removeEventListener("touchend", endTouch);
    window.removeEventListener("touchcancel", endTouch);
    window.removeEventListener("click", onClick);
    window.removeEventListener("keydown", onKeyDown);
    window.removeEventListener("resize", cancel);
    window.removeEventListener("hashchange", cancel);
    reduced.removeEventListener("change", cancel);
  };
}
