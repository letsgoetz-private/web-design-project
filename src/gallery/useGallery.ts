import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type RefObject,
  type MouseEvent,
  type PointerEvent,
} from "react";
import { isDrag, swipeDirection, trailingSpace, wrapIndex } from "./utils";
import type { PointerGesture, SelectPhotograph } from "./types";
import type { Photograph, Study } from "../portfolio/types";
import { imageUrl } from "../site/utils";

type useGalleryArgs = {
  study: Study;
  index: number;
  onSelect: SelectPhotograph;
  frameRef: RefObject<HTMLDivElement | null>;
  disabled: boolean;
};

export function useGallery({ study, index, onSelect, frameRef, disabled }: useGalleryArgs) {
  const photo = study.gallery[index];
  const lastPhoto = useRef(photo);
  const [previous, setPrevious] = useState<Photograph | null>(null);
  const requestedIndex = useRef(index);
  const request = useRef(0);
  const disabledRef = useRef(disabled);
  const gesture = useRef<PointerGesture | null>(null);
  const suppressClick = useRef(false);

  useLayoutEffect(() => {
    const gallery = frameRef.current?.closest<HTMLElement>(".study-gallery");
    const footer = gallery?.querySelector<HTMLElement>(".gallery-footer");
    const layout = gallery?.parentElement;
    if (!gallery || !footer || !layout) return;

    const updateSpace = () => {
      // Layout offsets ignore the thumbnail entrance animation. Moving the
      // thought does not change these sizes or move the photograph.
      const space = trailingSpace(gallery.clientHeight, footer.offsetTop, footer.offsetHeight);
      layout.style.setProperty("--gallery-trailing-space", `${space}px`);
    };
    const observer = new ResizeObserver(updateSpace);
    observer.observe(gallery);
    observer.observe(footer);
    updateSpace();
    return () => {
      observer.disconnect();
      layout.style.removeProperty("--gallery-trailing-space");
    };
  }, [frameRef]);

  useLayoutEffect(() => {
    disabledRef.current = disabled;
    if (disabled) {
      request.current += 1;
      requestedIndex.current = index;
      gesture.current = null;
    }
  }, [disabled, index]);

  useLayoutEffect(() => {
    if (lastPhoto.current.image !== photo.image) {
      // Both photographs share the animated frame, including on the return trip.
      setPrevious(lastPhoto.current);
      lastPhoto.current = photo;
    }
  }, [photo]);

  useEffect(() => {
    for (const step of [-1, 1]) {
      const preload = new Image();
      preload.src = imageUrl(study.gallery[wrapIndex(index + step, study.gallery.length)].image);
    }
  }, [index, study]);

  useEffect(
    () => () => {
      request.current += 1;
    },
    [],
  );

  const select = useCallback(
    async (next: number) => {
      if (disabledRef.current) return;
      requestedIndex.current = next;
      const ticket = ++request.current;
      const preload = new Image();
      preload.src = imageUrl(study.gallery[next].image);
      try {
        await preload.decode();
      } catch {
        return;
      }
      if (ticket === request.current && !disabledRef.current) onSelect(study.id, next);
    },
    [onSelect, study],
  );

  const move = useCallback(
    (step: number) => {
      void select(wrapIndex(requestedIndex.current + step, study.gallery.length));
    },
    [select, study],
  );

  useEffect(() => {
    const dialog = frameRef.current?.closest("dialog");
    const onKey = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey || disabledRef.current) return;
      if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        event.preventDefault();
        event.stopPropagation();
        move(event.key === "ArrowLeft" ? -1 : 1);
      }
    };
    dialog?.addEventListener("keydown", onKey);
    return () => dialog?.removeEventListener("keydown", onKey);
  }, [frameRef, move]);

  function next() {
    move(1);
  }
  function previousImage() {
    move(-1);
  }
  function selectThumbnail(event: MouseEvent<HTMLButtonElement>) {
    void select(Number(event.currentTarget.dataset.index));
  }
  function finishCrossfade() {
    setPrevious(null);
  }
  function clickPhoto(event: MouseEvent<HTMLDivElement>) {
    event.stopPropagation();
    // A swipe can also produce a click; it must only advance once.
    if (suppressClick.current && event.detail !== 0) {
      suppressClick.current = false;
      return;
    }
    move(1);
  }
  function startGesture(event: PointerEvent<HTMLDivElement>) {
    if (disabledRef.current || !event.isPrimary || event.button !== 0) return;
    suppressClick.current = false;
    gesture.current = { id: event.pointerId, x: event.clientX, y: event.clientY };
    event.currentTarget.setPointerCapture(event.pointerId);
  }
  function trackGesture(event: PointerEvent<HTMLDivElement>) {
    const start = gesture.current;
    if (start?.id === event.pointerId && isDrag(start, { x: event.clientX, y: event.clientY }))
      suppressClick.current = true;
  }
  function finishGesture(event: PointerEvent<HTMLDivElement>) {
    const start = gesture.current;
    gesture.current = null;
    if (!start || start.id !== event.pointerId || disabledRef.current) return;
    const direction = swipeDirection(start, { x: event.clientX, y: event.clientY });
    if (direction) {
      suppressClick.current = true;
      move(direction);
    }
  }
  function cancelGesture() {
    gesture.current = null;
    suppressClick.current = true;
  }

  return {
    previous,
    next,
    previousImage,
    selectThumbnail,
    finishCrossfade,
    clickPhoto,
    startGesture,
    trackGesture,
    finishGesture,
    cancelGesture,
  };
}
