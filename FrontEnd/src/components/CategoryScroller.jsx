import { Link } from "react-router-dom";
import CategoryImage from "./CategoryImage.jsx";
import { useCatalog } from "../context/CatalogContext.jsx";
import { useLanguage } from "../context/LanguageContext.jsx";
import { getCategoryName } from "../utils/catalog.js";

export default function CategoryScroller() {
  const { storefrontCategories: categories } = useCatalog();
  const { language } = useLanguage();

  if (!categories?.length) return null;

  return (
    <section className="container-page py-8 md:py-10">
      <div className="rounded-[1.75rem] border border-petal/60 bg-white/90 px-4 py-5 shadow-[0_14px_38px_rgba(190,24,93,0.07)] sm:px-5 md:px-6">
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide sm:gap-5 md:grid md:grid-cols-5 md:overflow-visible lg:grid-cols-6 xl:grid-cols-7">
          {categories.map((category) => {
            const name = getCategoryName(category, language);

            return (
              <Link
                key={category.id}
                to={`/category/${category.slug || category.id}`}
                className="group flex min-w-[6.5rem] flex-col items-center text-center transition duration-300 hover:-translate-y-1 md:min-w-0"
              >
                <div className="relative grid h-[5.8rem] w-[5.8rem] place-items-center rounded-full bg-gradient-to-br from-white via-ivory to-shell p-[3px] shadow-[0_12px_28px_rgba(190,24,93,0.11)] ring-1 ring-petal/70 transition duration-300 group-hover:shadow-[0_16px_35px_rgba(190,24,93,0.18)] group-hover:ring-clay/50 sm:h-[6.4rem] sm:w-[6.4rem]">
                  <div className="h-full w-full overflow-hidden rounded-full border border-petal/60 bg-white">
                    <CategoryImage
                      src={category.imageUrl}
                      name={name}
                      className="h-full w-full rounded-full border-0 bg-white shadow-none"
                      imageClassName="h-full w-full rounded-full object-cover p-0 transition duration-500 group-hover:scale-110"
                    />
                  </div>
                </div>

                <span className="mt-3 line-clamp-2 min-h-[2.35rem] max-w-[7rem] text-xs font-extrabold leading-5 text-ink transition duration-300 group-hover:text-terracotta sm:text-sm">
                  {name}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}