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
import type { Point, SelectPhotograph } from "./types";
import type { Photograph, Study } from "../portfolio/types";
import { imageUrl } from "../site/utils";

type PointerGesture = Point & { id: number };

type useGalleryArgs = {
  study: Study;
  index: number;
  onSelect: SelectPhotograph;
  frameRef: RefObject<HTMLDivElement | null>;
  disabled: boolean;
};

const updateSpace = (height: number, footerTop: number, footerHeight: number): string =>
  `${trailingSpace(height, footerTop, footerHeight)}px`;

export const useGallery = ({ study, index, onSelect, frameRef, disabled }: useGalleryArgs) => {
  const photo = study.gallery[index];
  const lastPhoto = useRef(photo);
  const [previous, setPrevious] = useState<Photograph | null>(null);
  const requestedIndex = useRef(index);
  const request = useRef(0);
  const disabledRef = useRef(disabled);
  const gesture = useRef<PointerGesture | null>(null);
  const suppressClick = useRef(false);

  const updateLayout = useCallback(() => {
    const gallery = frameRef.current?.closest<HTMLElement>(".study-gallery");
    const footer = gallery?.querySelector<HTMLElement>(".gallery-footer");
    const layout = gallery?.parentElement;
    if (!gallery || !footer || !layout) return;
    // Layout offsets ignore the thumbnail entrance animation.
    const space = updateSpace(gallery.clientHeight, footer.offsetTop, footer.offsetHeight);
    layout.style.setProperty("--gallery-trailing-space", space);
  }, [frameRef]);

  useLayoutEffect(() => {
    const gallery = frameRef.current?.closest<HTMLElement>(".study-gallery");
    const footer = gallery?.querySelector<HTMLElement>(".gallery-footer");
    const layout = gallery?.parentElement;
    if (!gallery || !footer || !layout) return;

    const observer = new ResizeObserver(updateLayout);
    observer.observe(gallery);
    observer.observe(footer);
    updateLayout();
    return () => {
      observer.disconnect();
      layout.style.removeProperty("--gallery-trailing-space");
    };
  }, [frameRef, updateLayout]);

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

  const onKey = useCallback(
    (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey || disabledRef.current) return;
      if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        event.preventDefault();
        event.stopPropagation();
        move(event.key === "ArrowLeft" ? -1 : 1);
      }
    },
    [move],
  );

  useEffect(() => {
    const dialog = frameRef.current?.closest("dialog");
    dialog?.addEventListener("keydown", onKey);
    return () => dialog?.removeEventListener("keydown", onKey);
  }, [frameRef, onKey]);

  const next = useCallback(() => {
    move(1);
  }, [move]);
  const previousImage = useCallback(() => {
    move(-1);
  }, [move]);
  const selectThumbnail = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      void select(Number(event.currentTarget.dataset.index));
    },
    [select],
  );
  const finishCrossfade = useCallback(() => {
    setPrevious(null);
  }, []);
  const clickPhoto = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      event.stopPropagation();
      // A swipe can also produce a click; it must only advance once.
      if (suppressClick.current && event.detail !== 0) {
        suppressClick.current = false;
        return;
      }
      move(1);
    },
    [move],
  );
  const startGesture = useCallback((event: PointerEvent<HTMLDivElement>) => {
    if (disabledRef.current || !event.isPrimary || event.button !== 0) return;
    suppressClick.current = false;
    gesture.current = { id: event.pointerId, x: event.clientX, y: event.clientY };
    event.currentTarget.setPointerCapture(event.pointerId);
  }, []);
  const trackGesture = useCallback((event: PointerEvent<HTMLDivElement>) => {
    const start = gesture.current;
    if (start?.id === event.pointerId && isDrag(start, { x: event.clientX, y: event.clientY }))
      suppressClick.current = true;
  }, []);
  const finishGesture = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      const start = gesture.current;
      gesture.current = null;
      if (!start || start.id !== event.pointerId || disabledRef.current) return;
      const direction = swipeDirection(start, { x: event.clientX, y: event.clientY });
      if (direction) {
        suppressClick.current = true;
        move(direction);
      }
    },
    [move],
  );
  const cancelGesture = useCallback(() => {
    gesture.current = null;
    suppressClick.current = true;
  }, []);

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
};
