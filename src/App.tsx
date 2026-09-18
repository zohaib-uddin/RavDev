import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartSidebar from './components/CartSidebar';
import Home from './pages/Home';
import CollectionsPage from './pages/CollectionsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import AdminPanel from './pages/AdminPanel';
import ShopAllPage from './pages/ShopAllPage';
import CheckoutPage from './pages/CheckoutPage';
import UserDashboard from './pages/UserDashboard';

export default function App() {
  return (
    <CartProvider>
      <Router>
        <div className="min-h-screen flex flex-col">
          <Toaster position="top-right" />
          <Navbar />
          <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<ShopAllPage />} />
            <Route path="/collections/:mainCategorySlug" element={<CollectionsPage />} />
            <Route path="/collections/:mainCategorySlug/:subCategorySlug" element={<CollectionsPage />} />
            <Route path="/products/:productSlug" element={<ProductDetailPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/dashboard" element={<UserDashboard />} />
            <Route path="/dashboard/:tab" element={<UserDashboard />} />
            <Route path="/admin" element={<AdminPanel />} />
          </Routes>          </main>
          <Footer />
          <CartSidebarWrapper />
        </div>
      </Router>
    </CartProvider>
  );
}

// Wrapper component to use useCart hook
import { useCart } from './context/CartContext';

function CartSidebarWrapper() {
  const { items, isOpen, newItemId, updateQuantity, removeItem, closeCart, clearNewItemId } = useCart();
  
  return (
    <CartSidebar
      isOpen={isOpen}
      onClose={() => {
        closeCart();
        clearNewItemId();
      }}
      items={items}
      onUpdateQuantity={updateQuantity}
      onRemoveItem={removeItem}
      newItemId={newItemId}
    />
  );
}
