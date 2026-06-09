import { Link } from "react-router-dom";
import CategoryImage from "./CategoryImage.jsx";
import { useCatalog } from "../context/CatalogContext.jsx";
import { useLanguage } from "../context/LanguageContext.jsx";
import { getCategoryName, getCategorySubtitle } from "../utils/catalog.js";

export default function CategoryScroller() {
  const { storefrontCategories: categories } = useCatalog();
  const { language } = useLanguage();

  return (
    <section className="container-page py-12">
      <div className="beauty-shell px-4 py-5">
        <div className="flex gap-4 overflow-x-auto pb-1">
        {categories.map((category) => {
          const name = getCategoryName(category, language);
          return (
            <Link
              key={category.id}
              to={`/category/${category.slug || category.id}`}
              className="group min-w-[8.5rem] text-center"
            >
              <CategoryImage
                src={category.imageUrl}
                name={name}
                className="mx-auto h-20 w-20 rounded-full border border-petal bg-shell shadow-sm transition duration-300 group-hover:-translate-y-1 group-hover:border-clay/50 group-hover:shadow-card"
                imageClassName="p-1.5"
              />
              <span className="mt-3 block text-sm font-extrabold text-ink">
                {name}
              </span>
              <span className="mt-1 block text-xs font-medium text-muted">
                {getCategorySubtitle(category, language)}
              </span>
            </Link>
          );
        })}
        </div>
      </div>
    </section>
  );
}
