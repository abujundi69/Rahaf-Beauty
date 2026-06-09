import { Navigate } from "react-router-dom";
import BrandLogo from "../../components/BrandLogo.jsx";
import RegisterForm from "../../components/auth/RegisterForm.jsx";
import { BRAND_NAME } from "../../config/brand.js";
import { useAuth } from "../../context/AuthContext.jsx";

export default function Register() {
  const { isAdmin, isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to={isAdmin ? "/admin" : "/"} replace />;
  }

  return (
    <section className="container-page grid min-h-[calc(100vh-12rem)] items-center py-12">
      <div className="grid gap-8 lg:grid-cols-[0.9fr_1fr] lg:items-center">
        <div className="hidden rounded-2xl border border-petal/70 bg-blush/70 p-8 shadow-sm lg:block">
          <div className="flex items-center gap-4">
            <BrandLogo size="drawer" className="rounded-xl bg-white p-1 ring-1 ring-petal" />
            <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-ink">
              {BRAND_NAME}
            </p>
          </div>
          <h2 className="mt-4 font-display text-5xl font-bold leading-tight text-ink">
            {`أنشئي حسابك في مساحة ${BRAND_NAME} الهادئة.`}
          </h2>
          <p className="mt-5 max-w-md text-base leading-7 text-muted">
            التسجيل مخصص للعملاء فقط باستخدام رقم الهاتف وكلمة المرور.
          </p>
        </div>
        <RegisterForm />
      </div>
    </section>
  );
}
