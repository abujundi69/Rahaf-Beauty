import CategoryImage from "./CategoryImage.jsx";
import SectionHeader from "./SectionHeader.jsx";
import { useLanguage } from "../context/LanguageContext.jsx";
import {
  getCategoryIntro,
  getCategoryName,
} from "../utils/catalog.js";

export default function CategoryHeader({ category }) {
  const { language, t } = useLanguage();
  const name = getCategoryName(category, language);

  return (
    <div className="mb-8 grid gap-5 md:grid-cols-[minmax(0,1fr)_minmax(12rem,18rem)] md:items-center">
      <SectionHeader
        eyebrow={t("category")}
        title={name}
        description={getCategoryIntro(category, language)}
      />
      <CategoryImage
        src={category.imageUrl}
        name={name}
        className="aspect-[4/3] w-full rounded-2xl border border-petal bg-white shadow-sm"
        imageClassName="p-3"
      />
    </div>
  );
}
