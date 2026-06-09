import { Link } from "react-router-dom";
import Button from "../components/Button.jsx";
import ProductGrid from "../components/ProductGrid.jsx";
import SectionHeader from "../components/SectionHeader.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useLanguage } from "../context/LanguageContext.jsx";
import { useStore } from "../utils/store.jsx";

export default function Wishlist() {
  const { isAdmin } = useAuth();
  const { wishlistProducts } = useStore();
  const { t } = useLanguage();

  if (isAdmin) {
    return (
      <section className="container-page py-16 text-center">
        <div className="mx-auto max-w-xl rounded-2xl bg-white p-8 shadow-sm">
          <h1 className="font-display text-3xl font-bold text-ink">
            {t("notAvailableForAdmin")}
          </h1>
          <p className="mt-3 text-sm leading-7 text-muted">
            {t("adminShoppingBlocked")}
          </p>
          <Button as={Link} to="/admin" className="mt-6">
            {t("adminDashboard")}
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="container-page py-10 md:py-14">
      <SectionHeader
        eyebrow={t("wishlist")}
        title="مفضلات التوهج المحفوظة"
        description="مساحة ناعمة للمنتجات التي ترغبين بالعودة إليها."
      />
      {wishlistProducts.length > 0 ? (
        <ProductGrid products={wishlistProducts} />
      ) : (
        <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
          <h2 className="font-display text-3xl font-bold text-ink">
            لا توجد منتجات محفوظة بعد
          </h2>
          <p className="mt-3 text-sm text-muted">
            ستظهر مفضلاتك الجمالية هنا.
          </p>
          <Button as={Link} to="/shop" className="mt-6">
            {t("shop")}
          </Button>
        </div>
      )}
    </section>
  );
}
