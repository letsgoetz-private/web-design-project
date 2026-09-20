export function siteUrl(path = "", basePath = import.meta.env.BASE_URL) {
  return `${basePath}${path.replace(/^\//, "")}`;
}

export function imageUrl(filename: string) {
  return siteUrl(`images/${filename}`);
}

export function imagePreviewUrl(filename: string, width: number) {
  return imageUrl(`previews/${filename.replace(/\.[^.]+$/, "")}-${width}.webp`);
}

export function imageSources(filename: string) {
  const sources = previewWidths.map((width) => `${imagePreviewUrl(filename, width)} ${width}w`);
  if (photographWidths[filename])
    sources.push(`${imageUrl(filename)} ${photographWidths[filename]}w`);
  return sources.join(", ");
}

export function pageSlug(pathname: string, basePath: string) {
  return pathname.startsWith(basePath) ? pathname.slice(basePath.length).replace(/\/$/, "") : "";
}
import originalWidths from "./image-widths.json";

const photographWidths: Record<string, number> = originalWidths;
const previewWidths = [320, 640, 960];
