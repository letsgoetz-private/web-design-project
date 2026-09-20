"""Generate page and thumbnail variants; preserve the original gallery photographs.

Requires Pillow. Run from any directory with: python scripts/optimize-images.py
"""

import json
from pathlib import Path

from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "public" / "images"
OUTPUT = SOURCE / "previews"
WIDTHS = (160, 320, 640, 960)


def main():
    OUTPUT.mkdir(exist_ok=True)
    original_widths = {}
    for path in sorted(SOURCE.glob("*.jpg")):
        with Image.open(path) as source:
            photograph = ImageOps.exif_transpose(source).convert("RGB")
            original_widths[path.name] = photograph.width
            for width in WIDTHS:
                height = round(photograph.height * width / photograph.width)
                preview = photograph.resize((width, height), Image.Resampling.LANCZOS)
                preview.save(
                    OUTPUT / f"{path.stem}-{width}.webp",
                    "WEBP",
                    quality=86,
                    method=6,
                    icc_profile=source.info.get("icc_profile", b""),
                )
    (ROOT / "src" / "site" / "image-widths.json").write_text(
        json.dumps(original_widths, indent=2) + "\n", encoding="utf-8"
    )


if __name__ == "__main__":
    main()
