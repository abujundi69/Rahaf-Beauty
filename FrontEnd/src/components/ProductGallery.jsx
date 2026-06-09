import { Image, Play } from "lucide-react";
import { useMemo, useState } from "react";
import { useLanguage } from "../context/LanguageContext.jsx";
import ProductMediaViewer from "./ProductMediaViewer.jsx";
import ProductVisual from "./ProductVisual.jsx";
import { cn } from "../utils/cn.js";
import {
  getMediaSource,
  getProductMediaImages,
  getProductMediaVideo,
  isFileMediaSource,
} from "../utils/media.js";

export default function ProductGallery({ product }) {
  const { t } = useLanguage();
  const media = useMemo(() => {
    const images = getProductMediaImages(product).map((item, itemIndex) => ({
      ...item,
      kind: "image",
      src: getMediaSource(item),
      label: `${t("images")} ${itemIndex + 1}`,
    }));
    const video = getProductMediaVideo(product);
    const videoSource = getMediaSource(video);

    return videoSource
      ? [...images, { ...video, kind: "video", src: videoSource, label: t("video") }]
      : images;
  }, [product, t]);
  const [index, setIndex] = useState(0);

  const previous = () =>
    setIndex((current) => (current === 0 ? media.length - 1 : current - 1));
  const next = () =>
    setIndex((current) => (current === media.length - 1 ? 0 : current + 1));

  return (
    <div>
      <ProductMediaViewer
        product={product}
        media={media}
        index={index}
        onPrevious={previous}
        onNext={next}
      />
      <div className="mt-4 grid grid-cols-4 gap-3">
        {media.map((item, itemIndex) => (
          <button
            key={`${item.kind}-${item.src}-${itemIndex}`}
            type="button"
            onClick={() => setIndex(itemIndex)}
            className={cn(
              "relative overflow-hidden rounded-2xl p-1 transition",
              index === itemIndex
                ? "bg-terracotta shadow-card"
                : "bg-white shadow-sm hover:bg-petal",
            )}
            aria-label={item.label}
          >
            {item.kind === "video" ? (
              <div className="grid aspect-square place-items-center rounded-xl bg-ink text-white">
                <Play className="h-5 w-5" aria-hidden="true" />
              </div>
            ) : isFileMediaSource(item.src) ? (
              <img
                src={item.src}
                alt=""
                className="aspect-square rounded-xl object-cover"
              />
            ) : (
              <ProductVisual
                product={{ id: product.id, image: item.src }}
                className="aspect-square rounded-xl"
              />
            )}
            {item.kind === "image" ? (
              <Image
                className="absolute bottom-2 end-2 h-3.5 w-3.5 text-white/80"
                aria-hidden="true"
              />
            ) : null}
          </button>
        ))}
      </div>
    </div>
  );
}
