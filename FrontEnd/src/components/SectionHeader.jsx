import { Link } from "react-router-dom";
import Button from "./Button.jsx";

export default function SectionHeader({
  eyebrow,
  title,
  description,
  action,
  actionTo,
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        {eyebrow ? (
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-terracotta">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="font-display text-3xl font-bold text-ink md:text-4xl">
          {title}
        </h2>
        {description ? (
          <p className="mt-3 max-w-xl text-sm leading-6 text-muted md:text-base">
            {description}
          </p>
        ) : null}
      </div>
      {action ? (
        <Button as={Link} to={actionTo} variant="outline" className="self-start">
          {action}
        </Button>
      ) : null}
    </div>
  );
}
