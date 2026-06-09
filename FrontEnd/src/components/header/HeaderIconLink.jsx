import { Link } from "react-router-dom";
import { formatNumber } from "../../utils/format.js";

export default function HeaderIconLink({ to, icon: Icon, label, count, onClick }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="relative grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white text-ink shadow-sm ring-1 ring-petal/70 transition hover:bg-petal focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta"
      aria-label={label}
    >
      <Icon className="h-[1.1rem] w-[1.1rem]" aria-hidden="true" />
      {count > 0 ? (
        <span
          className="absolute -top-1 end-[-0.25rem] grid h-5 min-w-5 place-items-center rounded-full bg-clay px-1 text-[0.68rem] font-bold text-white"
          dir="ltr"
        >
          {formatNumber(count)}
        </span>
      ) : null}
    </Link>
  );
}
