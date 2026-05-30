export function getImageUrl(path: string | null | undefined): string {
  if (!path) return "/placeholder.png";

  if (
    path.startsWith("blob:") ||
    path.startsWith("http") ||
    path.startsWith("https")
  ) {
    return path;
  }

  if (path.startsWith("/api/storage")) {
    return path;
  }

  return `/api/storage/${path.startsWith("/") ? path.slice(1) : path}`;
}
