/**
 * Transforms a Supabase Storage image URL to use the image transformation
 * API for smaller, cropped thumbnails. Reduces bandwidth by requesting
 * a resized image instead of the full original.
 */
export function getResizedImageUrl(
  url: string | null | undefined,
  width = 400,
  height = 250
): string | undefined {
  if (!url) return undefined;

  // Only transform Supabase storage public URLs
  const objectPublicPath = "/storage/v1/object/public/";
  if (!url.includes(objectPublicPath)) return url;

  const renderPath = "/storage/v1/render/image/public/";
  const transformed = url.replace(objectPublicPath, renderPath);
  const separator = transformed.includes("?") ? "&" : "?";
  return `${transformed}${separator}width=${width}&height=${height}&resize=contain`;
}
