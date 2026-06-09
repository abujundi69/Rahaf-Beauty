import { ImageOff } from "lucide-react";
import { useLanguage } from "../context/LanguageContext.jsx";
import { cn } from "../utils/cn.js";
import { getProductPrimaryImageSource, isFileMediaSource } from "../utils/media.js";

export default function ProductVisual({ product, className = "" }) {
  const { t } = useLanguage();
  const directImage = product?.image;
  const primaryImage =
    directImage && isFileMediaSource(directImage)
      ? directImage
      : getProductPrimaryImageSource(product);

  if (primaryImage && isFileMediaSource(primaryImage)) {
    return (
      <div
        className={cn(
          "relative isolate overflow-hidden rounded-2xl bg-gradient-to-br from-white via-ivory to-shell",
          className,
        )}
        aria-hidden="true"
      >
        <img
          src={primaryImage}
          alt=""
          className="h-full w-full object-cover transition duration-500"
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "grid place-items-center rounded-2xl border border-petal bg-gradient-to-br from-white via-ivory to-shell text-center text-muted",
        className,
      )}
    >
      <div className="px-3">
        <ImageOff className="mx-auto h-6 w-6 text-muted/70" aria-hidden="true" />
        <span className="mt-2 block text-xs font-bold">{t("noData")}</span>
      </div>
    </div>
  );
}
