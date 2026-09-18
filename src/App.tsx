import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import CollectionsPage from './pages/CollectionsPage';
import ProductDetail from './pages/ProductDetail';
import AdminPanel from './pages/AdminPanel';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Toaster position="top-right" />
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/collections/:mainCategorySlug" element={<CollectionsPage />} />
            <Route path="/collections/:mainCategorySlug/:subCategorySlug" element={<CollectionsPage />} />
            <Route path="/products/:productSlug" element={<ProductDetail />} />
            <Route path="/admin" element={<AdminPanel />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}
