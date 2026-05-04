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
import HomePage from './pages/HomePage';
import CategoryRoutePage from './pages/CategoryRoutePage';
import ProductPage from './pages/ProductPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AccountPage from './pages/AccountPage';
import OrdersPage from './pages/OrdersPage';
import OrderDetailPage from './pages/OrderDetailPage';
import SavedItemsPage from './pages/SavedItemsPage';
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProductsPage from './pages/admin/AdminProductsPage';
import ProductFormPage from './pages/admin/ProductFormPage';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';
import AdminCustomersPage from './pages/admin/AdminCustomersPage';
import SearchResults from './pages/SearchResults';
import NotFoundPage from './pages/NotFoundPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';

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
                          description="Fresh markdowns and limited-time deals across the collection."
                          saleOnly
                        />
                      }
                    />
                    <Route path="/product/:id" element={<ProductPage />} />
                    <Route path="/search" element={<SearchResults />} />
                    <Route path="/cart" element={<CartPage />} />
                    <Route path="/checkout" element={<CheckoutPage />} />
                    <Route path="/order-confirmation/:orderId" element={<OrderConfirmationPage />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/contact" element={<ContactPage />} />
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
              </BrowserRouter>
            </MiniCartProvider>
          </CartProvider>
        </OrdersProvider>
      </ProductCatalogProvider>
    </AuthProvider>
  );
}
