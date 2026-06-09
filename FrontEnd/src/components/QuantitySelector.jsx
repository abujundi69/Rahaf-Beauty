import { Minus, Plus } from "lucide-react";
import { formatNumber } from "../utils/format.js";
import { cn } from "../utils/cn.js";

export default function QuantitySelector({
  value,
  onChange,
  max = 99,
  size = "sm",
  disabled = false,
}) {
  const tiny = size === "xs";
  const compact = size === "sm";
  const buttonClass = tiny
    ? "h-6 w-6 rounded-lg"
    : compact
      ? "h-7 w-7 rounded-lg"
      : "h-10 w-10 rounded-xl";
  const valueClass = tiny
    ? "min-w-5 text-[0.68rem]"
    : compact
      ? "min-w-7 text-xs"
      : "min-w-10 text-sm";
  const wrapperClass = tiny
    ? "h-8 rounded-xl p-0.5"
    : compact
      ? "h-8 rounded-xl p-0.5"
      : "h-12 rounded-2xl p-1";

  const decrease = () => onChange(Math.max(1, value - 1));
  const increase = () => onChange(Math.min(max, value + 1));

  return (
    <div
      className={cn(
        "inline-flex items-center bg-ivory",
        wrapperClass,
        disabled && "opacity-50",
      )}
    >
      <button
        type="button"
        onClick={decrease}
        disabled={disabled || value <= 1}
        className={cn(
          "grid place-items-center text-muted transition hover:bg-white hover:text-ink disabled:cursor-not-allowed disabled:opacity-40",
          buttonClass,
        )}
        aria-label="-"
      >
        <Minus className={tiny || compact ? "h-3 w-3" : "h-4 w-4"} aria-hidden="true" />
      </button>
      <span
        className={cn(
          "grid place-items-center px-1 font-extrabold text-ink",
          valueClass,
        )}
      >
        {formatNumber(value)}
      </span>
      <button
        type="button"
        onClick={increase}
        disabled={disabled || value >= max}
        className={cn(
          "grid place-items-center text-muted transition hover:bg-white hover:text-ink disabled:cursor-not-allowed disabled:opacity-40",
          buttonClass,
        )}
        aria-label="+"
      >
        <Plus className={tiny || compact ? "h-3 w-3" : "h-4 w-4"} aria-hidden="true" />
      </button>
    </div>
  );
}
