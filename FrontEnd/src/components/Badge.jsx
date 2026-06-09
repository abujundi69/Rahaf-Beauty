import { cn } from "../utils/cn.js";

const styles = {
  sale: "bg-sale text-white shadow-sm",
  new: "bg-olive text-white shadow-sm",
  soft: "bg-shell text-terracotta ring-1 ring-petal/70",
  neutral: "bg-white text-muted ring-1 ring-petal/70",
};

export default function Badge({ children, tone = "soft", className = "" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-extrabold uppercase tracking-wide",
        styles[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
