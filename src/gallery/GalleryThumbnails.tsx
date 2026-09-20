import type { MouseEventHandler } from "react";
import type { Thumbnail } from "./types";
import { imagePreviewUrl } from "../site/utils";

type GalleryThumbnailsArgs = {
  thumbnails: Thumbnail[];
  disabled: boolean;
  onSelect: MouseEventHandler<HTMLButtonElement>;
};

export function GalleryThumbnails({ thumbnails, disabled, onSelect }: GalleryThumbnailsArgs) {
  return (
    <div className="gallery-thumbnails" aria-label="Choose a photograph">
      {thumbnails.map((thumbnail) => (
        <button
          key={thumbnail.image}
          className={thumbnail.selected ? "selected" : ""}
          data-index={thumbnail.index}
          disabled={disabled}
          aria-label={thumbnail.label}
          aria-pressed={thumbnail.selected}
          onClick={onSelect}
        >
          <img
            src={imagePreviewUrl(thumbnail.image, 160)}
            alt=""
            draggable={false}
            decoding="async"
          />
        </button>
      ))}
    </div>
  );
}
