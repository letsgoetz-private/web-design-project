import { act } from "react";
import { cleanup, fireEvent, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useSectionScroll } from "../src/navigation/useSectionScroll";
import { setReducedMotion } from "./setup";

const mountSections = (heights = [700, 700, 700]) => {
  // Model the browser's smooth-scroll boundary, not the app's interpolation.
  // The app must wait for arrival even if that takes longer on another browser.
  const instantScroll = window.scrollTo;
  let middleTimer: ReturnType<typeof setTimeout>;
  let endTimer: ReturnType<typeof setTimeout>;
  vi.stubGlobal(
    "scrollTo",
    vi.fn((options: ScrollToOptions) => {
      clearTimeout(middleTimer);
      clearTimeout(endTimer);
      if (options.behavior !== "smooth") return instantScroll(options);
      const start = window.scrollY;
      const finish = options.top ?? start;
      middleTimer = setTimeout(() => instantScroll({ top: (start + finish) / 2 }), 250);
      endTimer = setTimeout(() => {
        instantScroll({ top: finish });
        window.dispatchEvent(new Event("scrollend"));
      }, 1000);
    }),
  );
  Object.defineProperty(window, "innerHeight", { configurable: true, value: 800 });
  Object.defineProperty(document.documentElement, "scrollHeight", {
    configurable: true,
    value: 100 + heights.reduce((sum, height) => sum + height, 0),
  });
  document.body.innerHTML =
    "<header></header>" +
    heights
      .map(
        (_, index) =>
          `<section class="encounter" id="section-${index}"><button>Open photo</button></section>`,
      )
      .join("");
  vi.spyOn(document.querySelector("header")!, "getBoundingClientRect").mockReturnValue({
    height: 100,
  } as DOMRect);
  let top = 100;
  document.querySelectorAll("section").forEach((section, index) => {
    const sectionTop = top;
    const height = heights[index];
    vi.spyOn(section, "getBoundingClientRect").mockImplementation(
      () =>
        ({
          top: sectionTop - window.scrollY,
          bottom: sectionTop + height - window.scrollY,
          height,
        }) as DOMRect,
    );
    top += height;
  });
  renderHook(() => useSectionScroll(false));
};

const wheel = (deltaY: number) => {
  const event = new WheelEvent("wheel", { deltaY, bubbles: true, cancelable: true });
  window.dispatchEvent(event);
  return event;
};

const settle = async (duration = 1100) => {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(duration);
  });
};

afterEach(cleanup);

describe("section navigation", () => {
  it("delegates one smooth journey to the browser and pauses cues until arrival", async () => {
    mountSections();
    wheel(60);
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 700, behavior: "smooth" });
    expect(document.documentElement).toHaveClass("section-travelling");
    await settle(500);
    expect(document.documentElement).toHaveClass("section-travelling");
    expect(window.scrollTo).toHaveBeenCalledTimes(1);
    await settle(600);
    expect(window.scrollY).toBe(700);
    expect(document.documentElement).not.toHaveClass("section-travelling");
  });

  it("Escape stops travel at the current position and restores the cues", async () => {
    mountSections();
    wheel(60);
    await settle(400);
    const interruptedAt = window.scrollY;
    fireEvent.keyDown(document.body, { key: "Escape" });
    expect(document.documentElement).not.toHaveClass("section-travelling");
    await settle();
    expect(window.scrollY).toBe(interruptedAt);
    expect(location.hash).toBe("");
  });

  it("releases the journey when the destination is reached without a scrollend event", async () => {
    mountSections();
    wheel(60);
    await settle(300);
    // A browser can reach the destination before it reports the end of a touch gesture.
    Object.defineProperty(window, "scrollY", { configurable: true, value: 700 });
    await settle(150);
    expect(document.documentElement).not.toHaveClass("section-travelling");
    expect(location.hash).toBe("#section-1");
  });

  it("takes one section per gesture and drops input during travel instead of queuing it", async () => {
    mountSections();
    expect(wheel(60).defaultPrevented).toBe(true);
    await settle(300);
    expect(window.scrollY).toBeGreaterThan(0);
    expect(window.scrollY).toBeLessThan(700);
    wheel(80);
    await settle(500);
    wheel(100);
    await settle(400);
    expect(window.scrollY).toBe(700);
    expect(location.hash).toBe("#section-1");
    await settle();
    expect(window.scrollY).toBe(700);
    wheel(80);
    await settle();
    expect(window.scrollY).toBe(1400);
  });

  it("ignores downward scrolling at the last section, including reversed momentum", async () => {
    mountSections();
    window.scrollTo({ top: 1400 });
    wheel(80);
    await settle(50);
    wheel(-30);
    await settle();
    expect(window.scrollY).toBe(1400);
    wheel(-80);
    await settle();
    expect(window.scrollY).toBe(700);
  });

  it("allows native scrolling through a tall section before moving to the next", async () => {
    mountSections([1000, 700]);
    expect(wheel(80).defaultPrevented).toBe(false);
    window.scrollTo({ top: 300 });
    expect(wheel(80).defaultPrevented).toBe(true);
    await settle();
    expect(window.scrollY).toBe(1000);
  });

  it("leaves wheel scrolling native when reduced motion is requested", async () => {
    setReducedMotion(true);
    mountSections();
    expect(wheel(80).defaultPrevented).toBe(false);
    await settle();
    expect(window.scrollY).toBe(0);
  });

  it("supports keyboard navigation without taking keys from focused controls", async () => {
    mountSections();
    fireEvent.keyDown(document.querySelector("button")!, { key: "ArrowDown" });
    await settle();
    expect(window.scrollY).toBe(0);
    fireEvent.keyDown(document.body, { key: "ArrowDown" });
    await settle();
    expect(window.scrollY).toBe(700);
  });

  it("moves one section per touch swipe and waits for a new gesture", async () => {
    mountSections();
    fireEvent.touchStart(window, { touches: [{ clientX: 150, clientY: 500 }] });
    fireEvent.touchMove(window, { touches: [{ clientX: 150, clientY: 450 }] });
    await settle(500);
    fireEvent.touchMove(window, { touches: [{ clientX: 150, clientY: 250 }] });
    await settle();
    fireEvent.touchMove(window, { touches: [{ clientX: 150, clientY: 100 }] });
    await settle();
    expect(window.scrollY).toBe(700);
    fireEvent.touchEnd(window);
    fireEvent.touchStart(window, { touches: [{ clientX: 150, clientY: 200 }] });
    fireEvent.touchMove(window, { touches: [{ clientX: 150, clientY: 300 }] });
    await settle();
    expect(window.scrollY).toBe(0);
  });

  it("does not move the page behind an open photograph", async () => {
    mountSections();
    const dialog = document.createElement("dialog");
    dialog.open = true;
    document.body.append(dialog);
    wheel(80);
    fireEvent.keyDown(document.body, { key: "ArrowDown" });
    await settle();
    expect(window.scrollY).toBe(0);
  });
});
