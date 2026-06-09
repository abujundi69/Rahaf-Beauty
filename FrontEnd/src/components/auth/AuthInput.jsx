export default function AuthInput({
  label,
  icon: Icon,
  type = "text",
  value,
  onChange,
  inputMode,
  maxLength,
  autoComplete,
  required,
  error,
}) {
  return (
    <label className="block text-sm font-bold text-ink">
      {label}
      <span
        className={[
          "mt-2 flex h-12 items-center overflow-hidden rounded-full transition",
          error
            ? "bg-ivory ring-2 ring-sale/60"
            : "bg-ivory focus-within:ring-4 focus-within:ring-shell/70",
        ].join(" ")}
      >
        <span className="flex h-full w-11 shrink-0 items-center justify-center">
          <Icon className="h-4 w-4 text-muted" aria-hidden="true" />
        </span>
        <span className="h-5 w-px shrink-0 bg-petal/60" aria-hidden="true" />
        <input
          type={type}
          inputMode={inputMode}
          maxLength={maxLength}
          autoComplete={autoComplete}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          aria-invalid={Boolean(error)}
          className="h-full min-w-0 flex-1 bg-transparent px-3 text-sm text-ink outline-none"
        />
      </span>
      {error && (
        <span className="mt-2 block text-xs font-semibold text-sale">{error}</span>
      )}
    </label>
  );
}
