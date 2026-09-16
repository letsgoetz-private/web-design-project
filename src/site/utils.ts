export function siteUrl(path = "", basePath = import.meta.env.BASE_URL) {
  return `${basePath}${path.replace(/^\//, "")}`;
}

export function imageUrl(filename: string) {
  return siteUrl(`images/${filename}`);
}

export function pageSlug(pathname: string, basePath: string) {
  return pathname.startsWith(basePath) ? pathname.slice(basePath.length).replace(/\/$/, "") : "";
}
