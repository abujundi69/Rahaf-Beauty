import logo from "../assets/Logo.jpg";
import { BRAND_NAME } from "../config/brand.js";
import { cn } from "../utils/cn.js";

const sizes = {
  header: "h-12 w-12",
  mobile: "h-10 w-10",
  drawer: "h-14 w-14",
  sidebar: "h-14 w-14",
  auth: "h-32 w-40",
  footer: "h-24 w-32",
  settings: "h-24 w-24",
};

export default function BrandLogo({
  className = "",
  imageClassName = "",
  size = "header",
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center overflow-hidden",
        sizes[size],
        className,
      )}
    >
      <img
        src={logo}
        alt={BRAND_NAME}
        className={cn("h-full w-full object-contain", imageClassName)}
      />
    </span>
  );
}
