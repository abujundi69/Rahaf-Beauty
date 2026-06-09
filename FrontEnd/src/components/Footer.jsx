import { BRAND_NAME } from "../config/brand.js";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-petal/70 bg-gradient-to-r from-blush via-ivory to-shell text-ink">
      <div className="container-page flex flex-col items-center justify-center gap-4 py-8 text-center">
        <p className="text-sm font-semibold text-ink">
          © 2026 {BRAND_NAME}. جميع الحقوق محفوظة.
        </p>
      </div>
    </footer>
  );
}
