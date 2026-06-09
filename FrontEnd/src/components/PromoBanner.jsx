import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext.jsx";
import Button from "./Button.jsx";

export default function PromoBanner() {
  const { t } = useLanguage();

  return (
    <section className="container-page py-10">
      <div className="overflow-hidden rounded-2xl bg-ink text-white shadow-soft">
        <div className="grid gap-8 p-8 md:grid-cols-[1.1fr_0.9fr] md:p-10">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-shell">
              روتين نهاية الأسبوع
            </p>
            <h2 className="mt-3 font-display text-3xl font-bold leading-tight md:text-5xl">
              اصنعي روتين توهج أكثر نعومة.
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-6 text-white/68 md:text-base">
              اجمعي بين التنظيف اللطيف والترطيب بالببتيدات ولمسات اللون الهادئة لنهاية مصقولة وغير مبالغ فيها.
            </p>
            <Button as={Link} to="/shop" className="mt-7" variant="secondary">
              {t("sale")}
            </Button>
          </div>
          <div className="grid grid-cols-3 items-end gap-4">
            <div className="h-40 rounded-2xl bg-gradient-to-b from-white to-shell shadow-card" />
            <div className="h-56 rounded-2xl bg-gradient-to-b from-shell to-terracotta shadow-card" />
            <div className="h-32 rounded-2xl bg-gradient-to-b from-ivory to-clay shadow-card" />
          </div>
        </div>
      </div>
    </section>
  );
}
