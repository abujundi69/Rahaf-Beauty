import { Heart } from "lucide-react";
import { Link } from "react-router-dom";
import Button from "../../components/Button.jsx";
import ProductVisual from "../../components/ProductVisual.jsx";
import { useLanguage } from "../../context/LanguageContext.jsx";
import { useStoreSettings } from "../../context/StoreSettingsContext.jsx";
import {
  formatPrice,
  getBrandName,
  getProductName,
  toProductSlug,
} from "../../utils/catalog.js";
import { calculateProductPricing } from "../../utils/pricing.js";
import { useStore } from "../../utils/store.jsx";

function WishlistRow({ product }) {
  const { language, t } = useLanguage();
  const { settings } = useStoreSettings();
  const { toggleWishlist } = useStore();
  const pricing = calculateProductPricing(product, settings);
  const productPath = `/product/${toProductSlug(product)}`;

  return (
    <article className="grid gap-4 rounded-[1.2rem] border border-petal/70 bg-white/95 p-4 shadow-sm transition hover:border-clay/40 hover:bg-shell/40 sm:grid-cols-[6.5rem_1fr_auto]">
      <ProductVisual product={product} className="aspect-square" />
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-terracotta">
          {getBrandName(product.brand)}
        </p>
        <Link to={productPath}>
          <h3 className="mt-1 text-lg font-extrabold text-ink">
            {getProductName(product, language)}
          </h3>
        </Link>
        <p className="mt-3 text-lg font-extrabold text-ink">
          {formatPrice(pricing.finalPrice, language)}
        </p>
        {pricing.hasDiscount ? (
          <p className="mt-1 text-xs font-semibold text-muted line-through">
            {formatPrice(pricing.originalPrice, language)}
          </p>
        ) : null}
      </div>
      <div className="flex flex-wrap items-center gap-2 sm:flex-col sm:items-end">
        <Button as={Link} to={productPath} size="sm" variant="dark">
          {t("viewProduct")}
        </Button>
        <Button size="sm" variant="outline" onClick={() => toggleWishlist(product.id)}>
          <Heart className="h-4 w-4" aria-hidden="true" />
          {t("remove")}
        </Button>
      </div>
    </article>
  );
}

export default function AccountWishlist() {
  const { wishlistProducts } = useStore();
  const { t } = useLanguage();

  return (
    <section className="space-y-4">
      <div className="beauty-shell p-5">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-terracotta">
          {t("wishlist")}
        </p>
        <h2 className="mt-2 font-display text-3xl font-bold text-ink">{t("wishlist")}</h2>
      </div>
      {wishlistProducts.length ? (
        wishlistProducts.map((product) => <WishlistRow key={product.id} product={product} />)
      ) : (
        <div className="beauty-shell p-8 text-center">
          <p className="text-sm text-muted">لا توجد مفضلات بعد.</p>
        </div>
      )}
    </section>
  );
}
