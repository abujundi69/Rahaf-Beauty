import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import { useLanguage } from "../context/LanguageContext.jsx";
import ProductVisual from "./ProductVisual.jsx";
import { cn } from "../utils/cn.js";
import { isFileMediaSource } from "../utils/media.js";

export default function ProductMediaViewer({
  product,
  media,
  index,
  onPrevious,
  onNext,
  className = "",
}) {
  const { t } = useLanguage();
  const active = media[index] ?? media[0];

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl bg-white p-2 shadow-soft",
        className,
      )}
    >
      {active?.kind === "video" ? (
        <div className="relative aspect-square overflow-hidden rounded-2xl bg-ink md:aspect-[5/4]">
          <video
            src={active.src}
            controls
            className="h-full w-full object-cover"
            poster=""
          />
          <div className="pointer-events-none absolute start-4 top-4 inline-flex items-center gap-2 rounded-full bg-white/88 px-3 py-1.5 text-xs font-bold text-ink">
            <Play className="h-3.5 w-3.5 text-terracotta" aria-hidden="true" />
            {t("video")}
          </div>
        </div>
      ) : isFileMediaSource(active?.src ?? "") ? (
        <img
          src={active.src}
          alt=""
          className="aspect-square w-full rounded-2xl object-cover md:aspect-[5/4]"
        />
      ) : (
        <ProductVisual
          product={{ id: product.id, image: active?.src ?? product.image }}
          className="aspect-square w-full md:aspect-[5/4]"
        />
      )}

      {media.length > 1 ? (
        <>
          <button
            type="button"
            onClick={onPrevious}
            className="absolute start-4 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/86 text-ink shadow-sm transition hover:bg-white"
            aria-label="الوسيط السابق"
          >
            <ChevronLeft className="h-5 w-5 rtl:rotate-180" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={onNext}
            className="absolute end-4 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/86 text-ink shadow-sm transition hover:bg-white"
            aria-label="الوسيط التالي"
          >
            <ChevronRight className="h-5 w-5 rtl:rotate-180" aria-hidden="true" />
          </button>
        </>
      ) : null}
    </div>
  );
}
