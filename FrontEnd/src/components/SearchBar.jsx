import { Search } from "lucide-react";
import { cn } from "../utils/cn.js";

export default function SearchBar({
  value,
  onChange,
  onSubmit,
  placeholder = "ابحثي داخل RAHAF BEAUTY",
  className = "",
}) {
  return (
    <form className={cn("relative min-w-0", className)} onSubmit={onSubmit}>
      <Search
        className="pointer-events-none absolute start-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
        aria-hidden="true"
      />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-11 w-full rounded-full border border-petal/60 bg-white/90 py-2 pe-4 ps-11 text-sm font-semibold text-ink shadow-sm outline-none transition placeholder:text-muted/75 focus:border-clay/50 focus:bg-white focus:ring-4 focus:ring-shell/70"
      />
    </form>
  );
}
