import { SECTION_TOLERANCE } from "./consts";
import { keyDirection, neighbouringSection, sectionTarget, wheelDistance } from "./utils";

type TouchGesture = { x: number; y: number; consumed: boolean };

const SETTLE_CHECK_INTERVAL = 120;

const TRAVEL_TIMEOUT = 4000;

const GESTURE_GAP = 180;

const INTENT_DISTANCE = 12;

const NAVIGATION_KEYS = ["ArrowDown", "ArrowUp", "PageDown", "PageUp", " ", "Home", "End"];

const blocked = () => Boolean(document.querySelector("dialog[open]"));

const headerHeight = () => {
  return document.querySelector("header")?.getBoundingClientRect().height ?? 0;
};

const neighbour = (direction: number, sections: HTMLElement[]): HTMLElement | null | undefined => {
  const scrollY = window.scrollY;
  const viewportHeight = window.innerHeight;
  const header = headerHeight();
  const pageHeight = document.documentElement.scrollHeight;
  const index = neighbouringSection({
    sections: sections.map((section) => {
      const rect = section.getBoundingClientRect();
      return {
        target: sectionTarget({
          top: rect.top,
          scrollY,
          headerHeight: header,
          pageHeight,
          viewportHeight,
        }),
        height: rect.height,
        bottom: rect.bottom,
      };
    }),
    direction,
    scrollY,
    viewportHeight,
    headerHeight: header,
  });
  return index === null || index === undefined ? index : sections[index];
};

// One deliberate gesture, one section. Tall sections remain freely scrollable.
export const attachSectionScroll = () => {
  const sections = Array.from(document.querySelectorAll<HTMLElement>(".encounter"));
  if (!sections.length) return;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  let visibility: IntersectionObserver | null = null;
  const observeSections = () => {
    visibility?.disconnect();
    if (typeof IntersectionObserver === "undefined") return;
    visibility = new IntersectionObserver(
      (entries) => {
        for (const entry of entries)
          entry.target.classList.toggle("section-visible", entry.intersectionRatio >= 0.01);
      },
      { threshold: 0.01, rootMargin: `-${headerHeight()}px 0px 0px` },
    );
    document.documentElement.classList.add("sections-observed");
    sections.forEach((section) => visibility!.observe(section));
  };
  let settleTimer = 0;
  let moving = false;
  let destination: { section: HTMLElement; target: number; updateHash: boolean } | null = null;
  let lastWheel = -Infinity;
  let wheelDirection = 0;
  let distance = 0;
  let consumed = false;
  let touch: TouchGesture | null = null;

  const clearTravel = () => {
    window.clearTimeout(settleTimer);
    moving = false;
    destination = null;
    document.documentElement.classList.remove("section-travelling");
  };
  const cancel = () => {
    if (moving) window.scrollTo({ top: window.scrollY, behavior: "instant" });
    clearTravel();
  };
  const onResize = () => {
    cancel();
    observeSections();
  };
  const complete = () => {
    const arrival = destination;
    clearTravel();
    if (arrival?.updateHash) history.replaceState(history.state, "", `#${arrival.section.id}`);
  };
  const onScrollEnd = () => {
    if (!destination) return;
    if (Math.abs(window.scrollY - destination.target) <= SECTION_TOLERANCE) complete();
    else cancel();
  };

  const travel = (section: HTMLElement, updateHash = true) => {
    cancel();
    const start = window.scrollY;
    const finish = sectionTarget({
      top: section.getBoundingClientRect().top,
      scrollY: start,
      headerHeight: headerHeight(),
      pageHeight: document.documentElement.scrollHeight,
      viewportHeight: window.innerHeight,
    });
    destination = { section, target: finish, updateHash };
    if (reduced.matches || Math.abs(finish - start) < 1) {
      window.scrollTo({ top: finish, behavior: "instant" });
      complete();
      return;
    }
    const began = performance.now();
    moving = true;
    document.documentElement.classList.add("section-travelling");
    // The browser owns interpolation. JS only checks arrival for browsers that
    // lack scrollend, or defer it until the visitor lifts their finger.
    const checkArrival = () => {
      if (!moving) return;
      if (Math.abs(window.scrollY - finish) <= SECTION_TOLERANCE) complete();
      else if (performance.now() - began >= TRAVEL_TIMEOUT) cancel();
      else settleTimer = window.setTimeout(checkArrival, SETTLE_CHECK_INTERVAL);
    };
    window.scrollTo({ top: finish, behavior: "smooth" });
    settleTimer = window.setTimeout(checkArrival, SETTLE_CHECK_INTERVAL);
  };

  const neighbourCallback = (direction: number) => neighbour(direction, sections);

  const onWheel = (event: WheelEvent) => {
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
    const target = neighbourCallback(direction);
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
  };

  const onTouchStart = (event: TouchEvent) => {
    if (blocked() || event.touches.length !== 1) {
      touch = null;
      return;
    }
    touch = { x: event.touches[0].clientX, y: event.touches[0].clientY, consumed: moving };
  };
  const onTouchMove = (event: TouchEvent) => {
    if (!touch || blocked() || reduced.matches || event.touches.length !== 1) return;
    if (moving || touch.consumed) {
      touch.consumed = true;
      event.preventDefault();
      return;
    }
    const dx = touch.x - event.touches[0].clientX;
    const dy = touch.y - event.touches[0].clientY;
    if (Math.abs(dx) > Math.abs(dy) || !dy) return;
    const target = neighbourCallback(Math.sign(dy));
    if (target === null) return;
    event.preventDefault();
    if (!target) {
      touch.consumed = true;
      return;
    }
    if (Math.abs(dy) < INTENT_DISTANCE) return;
    touch.consumed = true;
    travel(target);
  };
  const endTouch = () => {
    touch = null;
  };

  const onClick = (event: MouseEvent) => {
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
  };
  const onKeyDown = (event: KeyboardEvent) => {
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
    const target = neighbourCallback(direction);
    if (target === null) return;
    event.preventDefault();
    if (target) travel(target);
  };

  observeSections();
  window.addEventListener("wheel", onWheel, { passive: false });
  window.addEventListener("touchstart", onTouchStart, { passive: true });
  window.addEventListener("touchmove", onTouchMove, { passive: false });
  window.addEventListener("touchend", endTouch);
  window.addEventListener("touchcancel", endTouch);
  window.addEventListener("click", onClick);
  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("resize", onResize);
  window.addEventListener("hashchange", cancel);
  window.addEventListener("scrollend", onScrollEnd);
  reduced.addEventListener("change", cancel);
  return () => {
    cancel();
    visibility?.disconnect();
    document.documentElement.classList.remove("sections-observed");
    sections.forEach((section) => section.classList.remove("section-visible"));
    window.removeEventListener("wheel", onWheel);
    window.removeEventListener("touchstart", onTouchStart);
    window.removeEventListener("touchmove", onTouchMove);
    window.removeEventListener("touchend", endTouch);
    window.removeEventListener("touchcancel", endTouch);
    window.removeEventListener("click", onClick);
    window.removeEventListener("keydown", onKeyDown);
    window.removeEventListener("resize", onResize);
    window.removeEventListener("hashchange", cancel);
    window.removeEventListener("scrollend", onScrollEnd);
    reduced.removeEventListener("change", cancel);
  };
};
