import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { MiniCartProvider } from './context/MiniCartContext';
import { OrdersProvider } from './context/OrdersContext';
import { ProductCatalogProvider } from './context/ProductCatalogContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import AdminLayout from './components/AdminLayout';
const HomePage = lazy(() => import('./pages/HomePage'));
const CategoryRoutePage = lazy(() => import('./pages/CategoryRoutePage'));
const ProductPage = lazy(() => import('./pages/ProductPage'));
const CartPage = lazy(() => import('./pages/CartPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const ShippingPage = lazy(() => import('./pages/ShippingPage'));
const ReturnsPage = lazy(() => import('./pages/ReturnsPage'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const AccountPage = lazy(() => import('./pages/AccountPage'));
const OrdersPage = lazy(() => import('./pages/OrdersPage'));
const OrderDetailPage = lazy(() => import('./pages/OrderDetailPage'));
const SavedItemsPage = lazy(() => import('./pages/SavedItemsPage'));
const AdminLoginPage = lazy(() => import('./pages/admin/AdminLoginPage'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminProductsPage = lazy(() => import('./pages/admin/AdminProductsPage'));
const ProductFormPage = lazy(() => import('./pages/admin/ProductFormPage'));
const AdminOrdersPage = lazy(() => import('./pages/admin/AdminOrdersPage'));
const AdminCustomersPage = lazy(() => import('./pages/admin/AdminCustomersPage'));
const SearchResults = lazy(() => import('./pages/SearchResults'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const OrderConfirmationPage = lazy(() => import('./pages/OrderConfirmationPage'));

function RouteLoadingFallback() {
  return (
    <div className="empty-state container" role="status" aria-live="polite" aria-busy="true">
      <h2>Loading ShopOra...</h2>
      <p>Preparing the next page.</p>
    </div>
  );
}

function SiteLayout() {
  return (
    <>
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ProductCatalogProvider>
        <OrdersProvider>
          <CartProvider>
            <MiniCartProvider>
              <BrowserRouter>
                <Suspense fallback={<RouteLoadingFallback />}>
                  <Routes>
                    <Route path="/admin/login" element={<AdminLoginPage />} />
                    <Route
                      path="/admin"
                      element={
                        <AdminRoute>
                          <AdminLayout />
                        </AdminRoute>
                      }
                    >
                      <Route index element={<AdminDashboard />} />
                      <Route path="products" element={<AdminProductsPage />} />
                      <Route path="products/new" element={<ProductFormPage mode="create" />} />
                      <Route path="products/:id/edit" element={<ProductFormPage mode="edit" />} />
                      <Route path="orders" element={<AdminOrdersPage />} />
                      <Route path="customers" element={<AdminCustomersPage />} />
                    </Route>
                    <Route element={<SiteLayout />}>
                      <Route path="/" element={<HomePage />} />
                      <Route
                        path="/women"
                        element={
                          <CategoryRoutePage
                            title="Women"
                            description="Effortless staples, polished layers, and standout pieces for every day."
                            department="women"
                          />
                        }
                      />
                      <Route
                        path="/men"
                        element={
                          <CategoryRoutePage
                            title="Men"
                            description="Refined essentials, smart casual layers, and modern everyday fits."
                            department="men"
                          />
                        }
                      />
                      <Route
                        path="/shoes"
                        element={
                          <CategoryRoutePage
                            title="Shoes"
                            description="Sneakers, loafers, heels, and boots with a polished finish."
                            department="shoes"
                          />
                        }
                      />
                      <Route
                        path="/accessories"
                        element={
                          <CategoryRoutePage
                            title="Accessories"
                            description="Bags, belts, jewelry, and finishing touches to complete every look."
                            department="accessories"
                          />
                        }
                      />
                      <Route
                        path="/sale"
                        element={
                          <CategoryRoutePage
                            title="Sale"
                            description="Current markdowns and value picks across the collection."
                            saleOnly
                          />
                        }
                      />
                      <Route path="/product/:id" element={<ProductPage />} />
                      <Route path="/search" element={<SearchResults />} />
                      <Route path="/cart" element={<CartPage />} />
                      <Route path="/checkout" element={<CheckoutPage />} />
                      <Route path="/orders" element={<Navigate to="/account/orders" replace />} />
                      <Route path="/saved" element={<Navigate to="/account/saved" replace />} />
                      <Route path="/order-confirmation/:orderId" element={<OrderConfirmationPage />} />
                      <Route path="/about" element={<AboutPage />} />
                      <Route path="/contact" element={<ContactPage />} />
                      <Route path="/shipping" element={<ShippingPage />} />
                      <Route path="/returns" element={<ReturnsPage />} />
                      <Route path="/privacy" element={<PrivacyPage />} />
                      <Route path="/login" element={<LoginPage />} />
                      <Route path="/register" element={<RegisterPage />} />
                      <Route
                        element={
                          <ProtectedRoute>
                            <Outlet />
                          </ProtectedRoute>
                        }
                      >
                        <Route path="account" element={<AccountPage />} />
                        <Route path="account/orders" element={<OrdersPage />} />
                        <Route path="account/orders/:orderId" element={<OrderDetailPage />} />
                        <Route path="account/saved" element={<SavedItemsPage />} />
                      </Route>
                    </Route>
                    <Route path="/home" element={<Navigate to="/" replace />} />
                    <Route path="*" element={<NotFoundPage />} />
                  </Routes>
                </Suspense>
              </BrowserRouter>
            </MiniCartProvider>
          </CartProvider>
        </OrdersProvider>
      </ProductCatalogProvider>
    </AuthProvider>
  );
}
