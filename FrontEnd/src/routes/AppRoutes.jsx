import { Route, Routes } from "react-router-dom";
import AccountLayout from "../components/account/AccountLayout.jsx";
import AdminLayout from "../components/admin/AdminLayout.jsx";
import Layout from "../components/Layout.jsx";
import AccountAddresses from "../pages/account/AccountAddresses.jsx";
import AccountDashboard from "../pages/account/AccountDashboard.jsx";
import AccountOrderDetails from "../pages/account/AccountOrderDetails.jsx";
import AccountOrders from "../pages/account/AccountOrders.jsx";
import AccountProfile from "../pages/account/AccountProfile.jsx";
import AccountSettings from "../pages/account/AccountSettings.jsx";
import AccountWishlist from "../pages/account/AccountWishlist.jsx";
import AdminCategories from "../pages/admin/AdminCategories.jsx";
import AdminCategoryFormPage from "../pages/admin/AdminCategoryFormPage.jsx";
import AdminCustomers from "../pages/admin/AdminCustomers.jsx";
import AdminDashboard from "../pages/admin/AdminDashboard.jsx";
import AdminOrders from "../pages/admin/AdminOrders.jsx";
import AdminProductPreview from "../pages/admin/AdminProductPreview.jsx";
import AdminProductFormPage from "../pages/admin/AdminProductFormPage.jsx";
import AdminProducts from "../pages/admin/AdminProducts.jsx";
import AdminAccountSettings from "../pages/admin/AdminAccountSettings.jsx";
import AdminSettings from "../pages/admin/AdminSettings.jsx";
import Login from "../pages/auth/Login.jsx";
import Register from "../pages/auth/Register.jsx";
import Cart from "../pages/Cart.jsx";
import Checkout from "../pages/Checkout.jsx";
import Category from "../pages/Category.jsx";
import Home from "../pages/Home.jsx";
import NotFound from "../pages/NotFound.jsx";
import ProductPage from "../pages/ProductPage.jsx";
import SearchResults from "../pages/SearchResults.jsx";
import Shop from "../pages/Shop.jsx";
import Wishlist from "../pages/Wishlist.jsx";
import AdminRoute from "./AdminRoute.jsx";
import CustomerRoute from "./CustomerRoute.jsx";

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/category/:slug" element={<Category />} />
        <Route path="/product/:slug" element={<ProductPage />} />
        <Route
          path="/cart"
          element={
            <CustomerRoute>
              <Cart />
            </CustomerRoute>
          }
        />
        <Route
          path="/wishlist"
          element={
            <CustomerRoute>
              <Wishlist />
            </CustomerRoute>
          }
        />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/checkout"
          element={
            <CustomerRoute>
              <Checkout />
            </CustomerRoute>
          }
        />

        <Route
          path="/account"
          element={
            <CustomerRoute>
              <AccountLayout />
            </CustomerRoute>
          }
        >
          <Route index element={<AccountDashboard />} />
          <Route path="profile" element={<AccountProfile />} />
          <Route path="addresses" element={<AccountAddresses />} />
          <Route path="orders" element={<AccountOrders />} />
          <Route path="orders/:id" element={<AccountOrderDetails />} />
          <Route path="wishlist" element={<AccountWishlist />} />
          <Route path="settings" element={<AccountSettings />} />
        </Route>

        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="products/new" element={<AdminProductFormPage />} />
          <Route path="products/:id" element={<AdminProductPreview />} />
          <Route
            path="products/:id/edit"
            element={<AdminProductFormPage mode="edit" />}
          />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="categories/new" element={<AdminCategoryFormPage />} />
          <Route
            path="categories/:id/edit"
            element={<AdminCategoryFormPage mode="edit" />}
          />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="customers" element={<AdminCustomers />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="account-settings" element={<AdminAccountSettings />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
