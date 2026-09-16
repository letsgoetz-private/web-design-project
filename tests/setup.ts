import "@testing-library/jest-dom/vitest";
import { afterEach, beforeEach, vi } from "vitest";

// jsdom has no layout or animation engine. Supply only those browser boundaries;
// tests exercise the actual application and assert visible outcomes.
let reducedMotion = false;
const animations = new WeakMap<Element, Animation[]>();

export function setReducedMotion(value: boolean) {
  reducedMotion = value;
}

beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.useFakeTimers();
  reducedMotion = false;
  window.history.replaceState(null, "", "/");
  Object.defineProperty(window, "scrollY", { configurable: true, writable: true, value: 0 });
  vi.stubGlobal("matchMedia", (query: string) => ({
    media: query,
    get matches() {
      return reducedMotion;
    },
    addEventListener() {},
    removeEventListener() {},
  }));
  vi.stubGlobal("scrollTo", (options: ScrollToOptions) => {
    Object.defineProperty(window, "scrollY", { configurable: true, value: options.top ?? 0 });
  });
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
  vi.stubGlobal(
    "PointerEvent",
    class extends MouseEvent {
      pointerId: number;
      isPrimary: boolean;
      constructor(type: string, options: PointerEventInit = {}) {
        super(type, options);
        this.pointerId = options.pointerId ?? 1;
        this.isPrimary = options.isPrimary ?? true;
      }
    },
  );
  HTMLImageElement.prototype.decode = vi.fn().mockResolvedValue(undefined);
  Element.prototype.setPointerCapture = vi.fn();
  Element.prototype.releasePointerCapture = vi.fn();
  Element.prototype.getAnimations = function () {
    return animations.get(this) ?? [];
  };
  Element.prototype.animate = function (_frames, options) {
    const duration = typeof options === "number" ? options : Number(options?.duration ?? 0);
    let timer: ReturnType<typeof setTimeout>;
    let reject: (error: Error) => void;
    const finished = new Promise<Animation>((resolve, rejectPromise) => {
      reject = rejectPromise;
      timer = setTimeout(() => resolve(animation), duration);
    });
    const animation = {
      finished,
      cancel() {
        clearTimeout(timer);
        reject(new Error("Animation cancelled"));
      },
    } as Animation;
    animations.set(this, [...(animations.get(this) ?? []), animation]);
    return animation;
  };
  HTMLDialogElement.prototype.showModal = function () {
    this.open = true;
  };
  HTMLDialogElement.prototype.close = function () {
    this.open = false;
  };
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.useRealTimers();
  document.documentElement.style.overflow = "";
  document.body.replaceChildren();
});
