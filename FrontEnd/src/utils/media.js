export const VIDEO_INLINE_LIMIT = 6 * 1024 * 1024;

export function isFileMediaSource(source = "") {
  return /^(data:|blob:|https?:\/\/)/.test(String(source));
}

export function getMediaSource(media) {
  if (!media) return "";
  if (typeof media === "string") return media;
  return media.dataUrl || media.previewUrl || media.objectUrl || media.url || media.src || "";
}

export function normalizeMediaItem(item, index = 0, fallbackType = "image") {
  if (!item) return null;
  const defaultName = `${fallbackType === "video" ? "فيديو" : "صورة"} ${index + 1}`;

  if (typeof item === "string") {
    return {
      id: `${fallbackType}-legacy-${index}`,
      name: defaultName,
      type: fallbackType,
      size: 0,
      previewUrl: item,
      dataUrl: isFileMediaSource(item) ? item : "",
    };
  }

  return {
    id: item.id || `${fallbackType}-${index}`,
    name: item.name || defaultName,
    type: item.type || fallbackType,
    size: Number(item.size) || 0,
    previewUrl: item.previewUrl || item.objectUrl || item.dataUrl || item.url || item.src || "",
    dataUrl: item.dataUrl || "",
    storage: item.storage || "",
  };
}

export function getProductMediaImages(product) {
  const mediaImages = product?.media?.images;

  if (Array.isArray(mediaImages) && mediaImages.length > 0) {
    return mediaImages
      .map((item, index) => normalizeMediaItem(item, index, "image"))
      .filter((item) => item && getMediaSource(item));
  }

  const legacyImages =
    Array.isArray(product?.images) && product.images.length > 0
      ? product.images
      : [product?.image].filter(Boolean);

  return legacyImages
    .map((item, index) => normalizeMediaItem(item, index, "image"))
    .filter((item) => item && getMediaSource(item));
}

export function getProductMediaVideo(product) {
  const video = normalizeMediaItem(product?.media?.video, 0, "video");
  if (video && getMediaSource(video)) return video;

  if (product?.videoUrl) {
    return normalizeMediaItem(product.videoUrl, 0, "video");
  }

  return null;
}

export function getProductPrimaryImageSource(product) {
  const [firstImage] = getProductMediaImages(product);
  return getMediaSource(firstImage);
}
