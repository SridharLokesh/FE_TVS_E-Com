import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import HomePage from "./pages/HomePage";
import ProductsPage from "./pages/ProductsPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import CartPage from "./pages/CartPage";
import WishlistPage from "./pages/WishlistPage";
import ProfilePage from "./pages/ProfilePage";
//import OrdersPage from './pages/OrdersPage';
import CheckoutPage from "./pages/CheckoutPage";
import CustomerCarePage from "./pages/CustomerCarePage";
import AdminDashboard from "./pages/AdminDashboard";
import { useAuth } from "./hooks/useAuth";
import { useCart } from "./hooks/useCart";
import { useWishlist } from "./hooks/useWishlist";
import ScrollToTop from "./components/ScrollToTop";

function ProtectedRoute({ children, user }) {
  return user ? children : <Navigate to="/login" replace />;
}

function AdminRoute({ children, user }) {
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "admin") return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  const auth = useAuth();
  const cartHook = useCart(auth.isLoggedIn);
  const wishlistHook = useWishlist(auth.isLoggedIn);

  const shared = { auth, cartHook, wishlistHook };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Toaster position="top-center" toastOptions={{ duration: 2500 }} />
      <ScrollToTop />
      {/* Fixed navbar – height ≈ 110px desktop (promo 28 + main 52 + categories 36) */}
      <Navbar auth={auth} cartHook={cartHook} wishlistHook={wishlistHook} />

      {/*
        Push content below the fixed navbar.
        Navbar has: promo bar (hidden on mobile) + main row + category row.
        Desktop: ~116px  |  Mobile: ~88px  (no promo)
        We use CSS variables so it's easy to tweak in one place.
      */}
      <main className="flex-1 pt-[88px] md:pt-[116px]">
        <Routes>
          {/* ── Public ── */}
          <Route path="/" element={<HomePage {...shared} />} />
          <Route path="/products" element={<ProductsPage {...shared} />} />
          <Route
            path="/products/category/:category"
            element={<ProductsPage {...shared} />}
          />
          <Route
            path="/products/:id"
            element={<ProductDetailPage {...shared} />}
          />
          <Route path="/login" element={<LoginPage auth={auth} />} />
          <Route path="/register" element={<RegisterPage auth={auth} />} />
          <Route path="/customer-care" element={<CustomerCarePage />} />
          <Route path="/become-seller" element={<CustomerCarePage />} />

          {/* ── Protected ── */}
          <Route
            path="/cart"
            element={
              <ProtectedRoute user={auth.user}>
                <CartPage cartHook={cartHook} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/wishlist"
            element={
              <ProtectedRoute user={auth.user}>
                <WishlistPage {...shared} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute user={auth.user}>
                <ProfilePage auth={auth} />
              </ProtectedRoute>
            }
          />
          {/*     <Route path="/orders" element={
            <ProtectedRoute user={auth.user}>
              <OrdersPage auth={auth} />
            </ProtectedRoute>
          } /> */}
          <Route
            path="/checkout"
            element={
              <ProtectedRoute user={auth.user}>
                <CheckoutPage auth={auth} cartHook={cartHook} />
              </ProtectedRoute>
            }
          />

          {/* ── Admin ── */}
          <Route
            path="/admin"
            element={
              <AdminRoute user={auth.user}>
                <AdminDashboard auth={auth} />
              </AdminRoute>
            }
          />

          {/* ── 404 fallback ── */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}
