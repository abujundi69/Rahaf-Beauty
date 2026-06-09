import { ArrowLeft, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "../assets/rahaf-hero.png";
import { useLanguage } from "../context/LanguageContext.jsx";
import Button from "./Button.jsx";

export default function Hero() {
  const { t } = useLanguage();

  return (
    <section className="relative isolate overflow-hidden soft-focus">
      <div className="absolute inset-0 -z-10">
        <img
          src={heroImage}
          alt=""
          className="h-full w-full object-cover object-center opacity-[0.82]"
        />
        <div className="absolute inset-0 bg-gradient-to-l from-ivory via-ivory/82 to-ivory/16" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-blush to-transparent" />
      </div>

      <div className="container-page grid min-h-[560px] items-center py-14 md:min-h-[640px]">
        <div className="max-w-2xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/82 px-4 py-2 text-sm font-bold text-terracotta shadow-sm">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            {t("beautyCosmetics")}
          </div>
          <h1 className="font-display text-5xl font-bold leading-[1.08] text-ink md:text-7xl">
            حيث تصبح كل لحظة عناية أكثر جمالا.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-muted md:text-lg">
            عناية ناعمة ومكياج مصقول وطقوس يومية مختارة لروتين هادئ ومضيء.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button as={Link} to="/shop" size="lg">
              {t("shop")}
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            </Button>
            <Button as={Link} to="/shop" variant="secondary" size="lg">
              {t("categories")}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
