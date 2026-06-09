import { Filter } from "lucide-react";
import { useState } from "react";
import Button from "./Button.jsx";
import FilterSidebar from "./FilterSidebar.jsx";
import { useLanguage } from "../context/LanguageContext.jsx";

export default function MobileFilters(props) {
  const [open, setOpen] = useState(false);
  const { t } = useLanguage();

  return (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={() => setOpen(true)}
        className="lg:hidden"
      >
        <Filter className="h-4 w-4" aria-hidden="true" />
        {t("filters")}
      </Button>
      {open ? (
        <div className="fixed inset-0 z-overlay lg:hidden">
          <button
            type="button"
            className="fixed inset-0 bg-ink/50 backdrop-blur-sm"
            aria-label={t("filters")}
            onClick={() => setOpen(false)}
          />
          <div className="fixed bottom-0 left-0 right-0 max-h-[88vh] overflow-y-auto overscroll-contain rounded-t-[1.75rem] bg-blush p-4 shadow-soft">
            <FilterSidebar {...props} onClose={() => setOpen(false)} />
          </div>
        </div>
      ) : null}
    </>
  );
}
