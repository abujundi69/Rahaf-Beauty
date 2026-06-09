import { NavLink } from "react-router-dom";

export default function DesktopNav({ links }) {
  return (
    <nav className="hidden border-t border-petal/70 bg-white/92 lg:block" aria-label="التنقل الرئيسي">
      <div className="container-wide flex min-h-12 items-center justify-center gap-1 overflow-x-auto py-2">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) =>
              `whitespace-nowrap rounded-full px-4 py-2 text-sm font-extrabold transition ${
                isActive
                  ? "bg-shell text-ink"
                  : "text-muted hover:bg-ivory hover:text-ink"
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
