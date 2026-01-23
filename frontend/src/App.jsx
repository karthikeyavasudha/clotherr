import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Checkout from './pages/Checkout';
import Account from './pages/Account';
import Login from './pages/Login';
import Signup from './pages/Signup';
import OrderHistory from './pages/OrderHistory';
import Cart from './components/features/Cart';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

// Legal pages
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsConditions from './pages/TermsConditions';
import RefundPolicy from './pages/RefundPolicy';
import ContactUs from './pages/ContactUs';
import ShippingPolicy from './pages/ShippingPolicy';

// Admin pages
import AdminLogin from './pages/admin/AdminLogin';
import Dashboard from './pages/admin/Dashboard';
import Products from './pages/admin/Products';
import Orders from './pages/admin/Orders';
import Customers from './pages/admin/Customers';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-red-50 p-4">
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-lg w-full">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h1>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto text-red-800">
              {this.state.error && this.state.error.toString()}
            </pre>
            <p className="mt-4 text-gray-600">Check the console for more details.</p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const Layout = ({ children }) => {
  const location = useLocation();
  const isAuthPage = ['/login', '/signup', '/forgot-password', '/reset-password'].includes(location.pathname) || location.pathname.startsWith('/reset-password');
  const isAdminPage = location.pathname.startsWith('/admin');

  // Don't show navbar, footer or cart on admin pages
  if (isAdminPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {!isAuthPage && <Navbar />}
      <Cart />
      <main className="flex-grow">
        {children}
      </main>
      {!isAuthPage && <Footer />}
    </div>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <CartProvider>
          <Router>
            <Layout>
              <Routes>
                {/* Customer Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/account" element={<Account />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/orders" element={<OrderHistory />} />

                {/* Legal Pages */}
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/terms-conditions" element={<TermsConditions />} />
                <Route path="/refund-policy" element={<RefundPolicy />} />
                <Route path="/shipping-policy" element={<ShippingPolicy />} />
                <Route path="/contact" element={<ContactUs />} />

                {/* Admin Routes */}
                <Route path="/admin" element={<AdminLogin />} />
                <Route path="/admin/dashboard" element={<Dashboard />} />
                <Route path="/admin/products" element={<Products />} />
                <Route path="/admin/orders" element={<Orders />} />
                <Route path="/admin/customers" element={<Customers />} />
              </Routes>
            </Layout>
          </Router>
        </CartProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
