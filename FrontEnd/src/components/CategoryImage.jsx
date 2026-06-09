import { ImageOff } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "../utils/cn.js";

export default function CategoryImage({
  src,
  alt = "",
  name = "",
  className = "",
  imageClassName = "",
  fallbackClassName = "",
}) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (src && !failed) {
    return (
      <span className={cn("block overflow-hidden bg-white", className)}>
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onError={() => setFailed(true)}
          className={cn("h-full w-full object-contain", imageClassName)}
        />
      </span>
    );
  }

  const initial = String(name || "").trim().slice(0, 1);

  return (
    <span
      className={cn(
        "grid place-items-center overflow-hidden bg-ivory text-muted",
        className,
        fallbackClassName,
      )}
    >
      {initial ? (
        <span className="text-2xl font-extrabold text-terracotta">{initial}</span>
      ) : (
        <ImageOff className="h-6 w-6 text-muted/70" aria-hidden="true" />
      )}
    </span>
  );
}
