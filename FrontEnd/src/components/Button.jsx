import { cn } from "../utils/cn.js";

const variants = {
  primary:
    "bg-gradient-to-r from-clay to-terracotta text-white shadow-[0_14px_30px_rgba(219,39,119,0.24)] hover:shadow-[0_18px_36px_rgba(219,39,119,0.3)] focus-visible:outline-terracotta",
  secondary:
    "border border-petal/70 bg-white text-terracotta shadow-card hover:border-clay/50 hover:bg-shell focus-visible:outline-terracotta",
  outline:
    "border border-clay/25 bg-white/90 text-ink shadow-sm hover:border-clay hover:bg-shell/60 hover:text-terracotta focus-visible:outline-terracotta",
  ghost:
    "bg-transparent text-ink hover:bg-shell focus-visible:outline-terracotta",
  dark: "bg-gradient-to-r from-charcoal to-terracotta text-white shadow-card hover:from-terracotta hover:to-clay focus-visible:outline-ink",
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
        "inline-flex items-center justify-center gap-2 rounded-full font-extrabold transition duration-200 hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:translate-y-0",
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
