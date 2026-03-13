import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/home/HomePage';
import AboutPage from './pages/about/AboutPage';
import ContactPage from './pages/contact/ContactPage';
import CatalogPage from './pages/catalog/CatalogPage';
import MainLayout from './layouts/MainLayout';
import ProductPage from './pages/product/ProductPage';
import CartPage from './pages/cart/CartPage';
import CheckoutPage from './pages/checkout/CheckoutPage';
import CheckoutSuccessPage from './pages/checkout-success/CheckoutSuccessPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import NotFoundPage from './pages/not-found/NotFoundPage';
import { CartProvider } from './features/cart';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <div className="App">
          <Routes>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<HomePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/checkout/success" element={<CheckoutSuccessPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/catalog" element={<CatalogPage />} />
              <Route path="/catalog/:slug" element={<ProductPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </div>
      </CartProvider>
    </BrowserRouter>
  );
}

export default App;
