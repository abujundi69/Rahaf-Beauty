import { BRAND_NAME } from "../config/brand.js";
import { cn } from "../utils/cn.js";
import BrandLogo from "./BrandLogo.jsx";

export default function BrandMark({
  className = "",
  logoSize = "header",
  textClassName = "",
}) {
  return (
    <span className={cn("inline-flex min-w-0 items-center gap-3", className)}>
      <BrandLogo
        size={logoSize}
        className="rounded-full bg-white p-0.5 shadow-sm ring-1 ring-petal"
      />
      <span
        className={cn(
          "truncate text-base font-extrabold tracking-wide text-ink",
          textClassName,
        )}
      >
        {BRAND_NAME}
      </span>
    </span>
  );
}
