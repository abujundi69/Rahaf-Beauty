import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "../assets/rahaf-hero.png";
import { useLanguage } from "../context/LanguageContext.jsx";
import Button from "./Button.jsx";

export default function Hero() {
  const { t } = useLanguage();

  return (
    <section className="relative isolate overflow-hidden bg-blush">
      <div className="absolute inset-0 -z-10">
        <img
          src={heroImage}
          alt=""
          className="h-full w-full object-cover object-center opacity-95"
        />
        <div className="absolute inset-0 bg-gradient-to-l from-white via-blush/85 to-white/20" />
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-ivory to-transparent" />
      </div>

      <div className="container-page grid min-h-[520px] items-center py-12 md:min-h-[620px] md:py-16">
        <div className="max-w-2xl text-right">
          <h1 className="max-w-2xl text-4xl font-black leading-[1.18] text-ink sm:text-5xl md:text-6xl">
            جمال ناعم لكل لحظة عناية
          </h1>
          <p className="mt-5 max-w-xl text-base font-semibold leading-8 text-secondary md:text-lg">
            اختيارات راقية من العناية بالبشرة، المكياج، العطور، ومنتجات الجمال اليومية بتجربة تسوق هادئة ومريحة.
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
