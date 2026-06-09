import { NavLink } from "react-router-dom";

export default function DesktopNav({ links }) {
  return (
    <nav
      className="hidden border-t border-white/20 bg-gradient-to-r from-clay via-rose to-terracotta text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] lg:block"
      aria-label="Primary navigation"
    >
      <div className="container-wide flex min-h-14 items-center justify-center gap-1.5 overflow-x-auto py-2.5">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) =>
              `whitespace-nowrap rounded-full px-4 py-2 text-sm font-extrabold transition duration-200 ${
                isActive
                  ? "bg-white text-terracotta shadow-sm"
                  : "text-white/90 hover:bg-white/20 hover:text-white"
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
