import { cn } from "../utils/cn.js";

const variants = {
  primary:
    "bg-clay text-white shadow-card hover:bg-terracotta focus-visible:outline-terracotta",
  secondary:
    "bg-ivory text-ink shadow-card hover:bg-shell focus-visible:outline-terracotta",
  outline:
    "border border-clay/30 bg-white/80 text-ink hover:border-clay hover:bg-white focus-visible:outline-terracotta",
  ghost:
    "bg-transparent text-ink hover:bg-petal/70 focus-visible:outline-terracotta",
  dark: "bg-charcoal text-white hover:bg-ink focus-visible:outline-ink",
};

const sizes = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-base",
  icon: "h-10 w-10 p-0",
};

export default function Button({
  as: Component = "button",
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}) {
  return (
    <Component
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-2xl font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-55",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  );
}
