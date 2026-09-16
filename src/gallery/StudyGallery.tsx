import type { RefObject } from "react";
import type { Study } from "../portfolio/types";
import type { SelectPhotograph } from "./types";
import { GalleryEdge } from "./GalleryEdge";
import { GalleryThumbnails } from "./GalleryThumbnails";
import { useGallery } from "./useGallery";
import { buildThumbnails, photographCount } from "./utils";
import { imageUrl } from "../site/utils";

type StudyGalleryArgs = {
  study: Study;
  index: number;
  onSelect: SelectPhotograph;
  frameRef: RefObject<HTMLDivElement | null>;
  disabled: boolean;
};

export function StudyGallery({ study, index, onSelect, frameRef, disabled }: StudyGalleryArgs) {
  const gallery = useGallery({ study, index, onSelect, frameRef, disabled });
  const photo = study.gallery[index];
  const thumbnails = buildThumbnails(study, index);
  return (
    <section
      className="study-gallery"
      aria-label={`${study.category} gallery`}
      aria-roledescription="carousel"
    >
      <div className="gallery-stage">
        <GalleryEdge
          direction="previous"
          category={study.category}
          disabled={disabled}
          onClick={gallery.previousImage}
        />
        <div className="gallery-image-well">
          <div
            ref={frameRef}
            className="detail-photo"
            data-gallery-photo
            role="group"
            aria-roledescription="slide"
            aria-label={`Photograph ${index + 1} of ${study.gallery.length}`}
            onClick={gallery.clickPhoto}
            onPointerDown={gallery.startGesture}
            onPointerMove={gallery.trackGesture}
            onPointerUp={gallery.finishGesture}
            onPointerCancel={gallery.cancelGesture}
          >
            <img src={imageUrl(photo.image)} alt={photo.alt} draggable={false} />
            {gallery.previous && (
              <img
                key={gallery.previous.image}
                className="gallery-previous-photo"
                src={imageUrl(gallery.previous.image)}
                alt=""
                aria-hidden="true"
                draggable={false}
                onAnimationEnd={gallery.finishCrossfade}
              />
            )}
            <button
              className="gallery-photo-next"
              disabled={disabled}
              aria-label={`View next ${study.category.toLowerCase()} photograph`}
            />
          </div>
        </div>
        <GalleryEdge
          direction="next"
          category={study.category}
          disabled={disabled}
          onClick={gallery.next}
        />
      </div>
      <div className="gallery-footer gallery-controls">
        <GalleryThumbnails
          thumbnails={thumbnails}
          disabled={disabled}
          onSelect={gallery.selectThumbnail}
        />
        <span className="gallery-count" role="status" aria-live="polite" aria-atomic="true">
          <span className="sr-only">Photograph </span>
          {photographCount(index, study.gallery.length)}
        </span>
      </div>
    </section>
  );
}
