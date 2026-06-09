import { cn } from "../utils/cn.js";

const styles = {
  sale: "bg-sale text-white",
  new: "bg-olive text-white",
  soft: "bg-petal text-terracotta",
  neutral: "bg-ivory text-muted",
};

export default function Badge({ children, tone = "soft", className = "" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wide",
        styles[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
