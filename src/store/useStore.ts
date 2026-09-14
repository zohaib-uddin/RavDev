import { create } from 'zustand';
import api from '../services/api';

// Types
export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  base_price: number;
  compare_at_price: number | null;
  is_active: boolean;
  category_id: string | null;
  category_slug?: string;
  category_name?: string;
  brand: string;
  fabric: string | null;
  fit: string | null;
  sku: string | null;
  is_new_arrival: boolean;
  is_bestseller: boolean;
  is_featured: boolean;
  is_best_seller: boolean;
  badge: string | null;
  images: string[];
  image_url: string | null;
  attributes: { sizes: string[]; colors: string[] };
  fabric_composition: string | null;
  fabric_finish: string | null;
  graphic_print: string | null;
  garment_specs: string | null;
  garment_care: string | null;
  shipping_info: string | null;
  meta_title: string | null;
  meta_description: string | null;
  focus_keywords: string | null;
  status: string;
  is_draft: boolean;
  created_at: string;
  updated_at: string;
  // Computed
  price?: number;
  salePrice?: number;
  image?: string;
  sizes?: string[];
  colors?: string[];
  stockCount?: number;
  inStock?: boolean;
  isNew?: boolean;
  isFeatured?: boolean;
  isBestseller?: boolean;
  details?: string[];
  material?: string;
  category?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  size: string;
  color: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'customer' | 'admin';
  is_verified?: boolean;
}

export interface Order {
  id: string;
  order_number: string;
  user_id: string;
  items: CartItem[];
  total: number;
  subtotal: number;
  shipping_cost: number;
  status: string;
  date: string;
  address: any;
}

export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  user_name: string;
  rating: number;
  comment: string;
  is_approved: boolean;
  date: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  cover_image_url: string | null;
  is_active: boolean;
  sort_order: number;
  tag: string | null;
}

// Demo data for when API is unavailable
const demoProducts: Product[] = [
  {
    id: '1', name: 'Shadow Realm Co-Ord Set', slug: 'shadow-realm-co-ord', description: 'Premium cotton co-ord set with shadow realm graphic print.', base_price: 4500, compare_at_price: 3990, is_active: true, category_id: '1', category_slug: 'co-ord-sets', category_name: 'Co-Ord Sets', brand: 'RAVENZA', fabric: '100% Cotton', fit: 'Oversized', sku: 'RVZ-CO-001', is_new_arrival: true, is_bestseller: true, is_featured: true, is_best_seller: true, badge: 'NEW', images: ['https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&h=750&fit=crop'], image_url: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&h=750&fit=crop', attributes: { sizes: ['S', 'M', 'L', 'XL'], colors: ['Black', 'Charcoal'] }, fabric_composition: '100% Premium Cotton', fabric_finish: 'Matte', graphic_print: 'Shadow Realm Screen Print', garment_specs: '260 GSM', garment_care: 'Machine wash cold', shipping_info: 'Free shipping above Rs.3000', meta_title: null, meta_description: null, focus_keywords: null, status: 'active', is_draft: false, created_at: '2024-01-15', updated_at: '2024-01-15', price: 4500, salePrice: 3990, image: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&h=750&fit=crop', sizes: ['S', 'M', 'L', 'XL'], colors: ['Black', 'Charcoal'], stockCount: 45, inStock: true, isNew: true, isFeatured: true, isBestseller: true, details: ['100% Premium Cotton', 'Oversized Relaxed Fit', 'Screen Printed Graphics'], material: '100% Cotton', category: 'co-ord-sets',
  },
  {
    id: '2', name: 'Acid Wash Phantom Tee', slug: 'acid-wash-phantom', description: 'Authentic acid wash oversized tee.', base_price: 2800, compare_at_price: 2499, is_active: true, category_id: '2', category_slug: 'oversize-tees', category_name: 'Oversize Tees', brand: 'RAVENZA', fabric: 'Acid Wash Cotton', fit: 'Oversized', sku: 'RVZ-TS-002', is_new_arrival: true, is_bestseller: true, is_featured: true, is_best_seller: true, badge: 'BESTSELLER', images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=750&fit=crop'], image_url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=750&fit=crop', attributes: { sizes: ['S', 'M', 'L', 'XL', '2XL'], colors: ['Smoky Black', 'Faded Teal'] }, fabric_composition: 'Acid Wash Cotton', fabric_finish: 'Acid Washed', graphic_print: 'Phantom Back Print', garment_specs: '240 GSM', garment_care: 'Wash separately', shipping_info: 'Free shipping above Rs.3000', meta_title: null, meta_description: null, focus_keywords: null, status: 'active', is_draft: false, created_at: '2024-01-20', updated_at: '2024-01-20', price: 2800, salePrice: 2499, image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=750&fit=crop', sizes: ['S', 'M', 'L', 'XL', '2XL'], colors: ['Smoky Black', 'Faded Teal'], stockCount: 80, inStock: true, isNew: true, isFeatured: true, isBestseller: true, details: ['Acid Washed Fabric', 'Drop Shoulder Design'], material: 'Acid Wash Cotton', category: 'oversize-tees',
  },
  {
    id: '3', name: 'Wide Leg Graphic Trouser', slug: 'wide-leg-graphic', description: 'Premium wide leg trouser.', base_price: 3200, compare_at_price: 2890, is_active: true, category_id: '3', category_slug: 'graphic-trousers', category_name: 'Graphic Trousers', brand: 'RAVENZA', fabric: 'Premium Twill', fit: 'Wide Leg', sku: 'RVZ-TR-003', is_new_arrival: false, is_bestseller: true, is_featured: true, is_best_seller: true, badge: null, images: ['https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&h=750&fit=crop'], image_url: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&h=750&fit=crop', attributes: { sizes: ['S', 'M', 'L', 'XL'], colors: ['Black', 'Navy'] }, fabric_composition: 'Premium Twill Cotton', fabric_finish: 'Matte Twill', graphic_print: 'All-Over Graphic', garment_specs: '280 GSM', garment_care: 'Machine wash cold', shipping_info: 'Free shipping above Rs.3000', meta_title: null, meta_description: null, focus_keywords: null, status: 'active', is_draft: false, created_at: '2024-02-01', updated_at: '2024-02-01', price: 3200, salePrice: 2890, image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&h=750&fit=crop', sizes: ['S', 'M', 'L', 'XL'], colors: ['Black', 'Navy'], stockCount: 60, inStock: true, isNew: false, isFeatured: true, isBestseller: true, details: ['Premium Twill Fabric', 'Wide Leg Silhouette'], material: 'Premium Twill', category: 'graphic-trousers',
  },
  {
    id: '4', name: 'Reaper X Graphic Co-Ord', slug: 'reaper-x-coord', description: 'Bold reaper graphics on premium cotton.', base_price: 4800, compare_at_price: 4290, is_active: true, category_id: '1', category_slug: 'co-ord-sets', category_name: 'Co-Ord Sets', brand: 'RAVENZA', fabric: 'Premium Cotton', fit: 'Oversized', sku: 'RVZ-CO-007', is_new_arrival: true, is_bestseller: true, is_featured: true, is_best_seller: true, badge: 'HOT', images: ['https://images.unsplash.com/photo-1578593139862-435adc1d20b8?w=600&h=750&fit=crop'], image_url: 'https://images.unsplash.com/photo-1578593139862-435adc1d20b8?w=600&h=750&fit=crop', attributes: { sizes: ['S', 'M', 'L', 'XL'], colors: ['Black', 'Dark Grey'] }, fabric_composition: '100% Premium Cotton', fabric_finish: 'Matte', graphic_print: 'Reaper X All-Over', garment_specs: '260 GSM', garment_care: 'Machine wash cold', shipping_info: 'Free shipping above Rs.3000', meta_title: null, meta_description: null, focus_keywords: null, status: 'active', is_draft: false, created_at: '2024-03-10', updated_at: '2024-03-10', price: 4800, salePrice: 4290, image: 'https://images.unsplash.com/photo-1578593139862-435adc1d20b8?w=600&h=750&fit=crop', sizes: ['S', 'M', 'L', 'XL'], colors: ['Black', 'Dark Grey'], stockCount: 25, inStock: true, isNew: true, isFeatured: true, isBestseller: true, details: ['Premium 260 GSM Cotton', 'Limited Edition'], material: 'Premium Cotton', category: 'co-ord-sets',
  },
];

const demoCategories: Category[] = [
  { id: '1', name: 'Co-Ord Sets', slug: 'co-ord-sets', description: 'Matching sets', cover_image_url: null, is_active: true, sort_order: 1, tag: 'TRENDING' },
  { id: '2', name: 'Oversize Tees', slug: 'oversize-tees', description: 'Oversized tees', cover_image_url: null, is_active: true, sort_order: 2, tag: 'POPULAR' },
  { id: '3', name: 'Graphic Trousers', slug: 'graphic-trousers', description: 'Wide leg trousers', cover_image_url: null, is_active: true, sort_order: 3, tag: null },
  { id: '4', name: 'Trackpants', slug: 'trackpants', description: 'Comfortable trackpants', cover_image_url: null, is_active: true, sort_order: 4, tag: null },
  { id: '5', name: 'Graphic Shorts', slug: 'graphic-shorts', description: 'Bold shorts', cover_image_url: null, is_active: true, sort_order: 5, tag: 'NEW' },
  { id: '6', name: 'Shirts & Jackets', slug: 'shirts', description: 'Outerwear', cover_image_url: null, is_active: true, sort_order: 6, tag: null },
];

const demoReviews: Review[] = [
  { id: '1', product_id: '1', user_id: '1', user_name: 'Ahmed Khan', rating: 5, comment: 'Amazing quality!', is_approved: true, date: '2024-01-15' },
  { id: '2', product_id: '2', user_id: '2', user_name: 'Sara Ali', rating: 5, comment: 'Love the acid wash effect!', is_approved: true, date: '2024-01-20' },
];

interface StoreState {
  user: User | null;
  cart: CartItem[];
  wishlist: string[];
  products: Product[];
  categories: Category[];
  orders: Order[];
  reviews: Review[];
  isLoading: boolean;
  apiAvailable: boolean;
  
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, name: string, password: string) => Promise<boolean>;
  logout: () => void;
  addToCart: (product: Product, size: string, color: string) => void;
  removeFromCart: (productId: string, size: string) => void;
  updateCartQuantity: (productId: string, size: string, quantity: number) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string) => void;
  fetchProducts: () => Promise<void>;
  fetchCategories: () => Promise<void>;
  fetchOrders: () => Promise<void>;
  addOrder: (order: Order) => void;
  updateOrderStatus: (orderId: string, status: string) => void;
  updateProduct: (id: string, data: Partial<Product>) => void;
  addProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
}

export const useStore = create<StoreState>((set, get) => ({
  user: null,
  cart: [],
  wishlist: [],
  products: demoProducts,
  categories: demoCategories,
  orders: [],
  reviews: demoReviews,
  isLoading: false,
  apiAvailable: false,

  login: async (email: string, password: string) => {
    try {
      const result = await api.login(email, password);
      api.setToken(result.token);
      set({ user: result.user, apiAvailable: true });
      return true;
    } catch {
      // Fallback to demo mode
      if (email === 'admin@ravenza.pk' && password === 'admin123') {
        set({ user: { id: 'admin', email, name: 'Admin', role: 'admin', is_verified: true }, apiAvailable: false });
        return true;
      }
      if (email && password.length >= 6) {
        set({ user: { id: Date.now().toString(), email, name: email.split('@')[0], role: 'customer', is_verified: true }, apiAvailable: false });
        return true;
      }
      return false;
    }
  },

  register: async (email: string, name: string, password: string) => {
    try {
      const result = await api.register(email, name, password);
      api.setToken(result.token);
      set({ user: result.user, apiAvailable: true });
      return true;
    } catch {
      if (email && name && password.length >= 6) {
        set({ user: { id: Date.now().toString(), email, name, role: 'customer', is_verified: false }, apiAvailable: false });
        return true;
      }
      return false;
    }
  },

  logout: () => {
    api.clearToken();
    set({ user: null, cart: [], wishlist: [] });
  },

  addToCart: (product, size, color) => {
    const { cart } = get();
    const existing = cart.find(item => item.product.id === product.id && item.size === size && item.color === color);
    if (existing) {
      set({ cart: cart.map(item =>
        item.product.id === product.id && item.size === size && item.color === color
          ? { ...item, quantity: item.quantity + 1 } : item
      )});
    } else {
      set({ cart: [...cart, { product, quantity: 1, size, color }] });
    }
  },

  removeFromCart: (productId, size) => {
    set({ cart: get().cart.filter(item => !(item.product.id === productId && item.size === size)) });
  },

  updateCartQuantity: (productId, size, quantity) => {
    if (quantity <= 0) { get().removeFromCart(productId, size); return; }
    set({ cart: get().cart.map(item =>
      item.product.id === productId && item.size === size ? { ...item, quantity } : item
    )});
  },

  clearCart: () => set({ cart: [] }),

  toggleWishlist: (productId) => {
    const { wishlist } = get();
    if (wishlist.includes(productId)) {
      set({ wishlist: wishlist.filter(id => id !== productId) });
    } else {
      set({ wishlist: [...wishlist, productId] });
    }
  },

  fetchProducts: async () => {
    set({ isLoading: true });
    try {
      const products = await api.getProducts();
      set({ products, apiAvailable: true });
    } catch {
      set({ apiAvailable: false });
    }
    set({ isLoading: false });
  },

  fetchCategories: async () => {
    try {
      const categories = await api.getCategories();
      set({ categories, apiAvailable: true });
    } catch {
      set({ apiAvailable: false });
    }
  },

  fetchOrders: async () => {
    try {
      const orders = await api.getOrders();
      set({ orders, apiAvailable: true });
    } catch {
      set({ apiAvailable: false });
    }
  },

  addOrder: (order) => {
    set({ orders: [...get().orders, order] });
    api.createOrder(order).catch(() => {});
  },

  updateOrderStatus: (orderId, status) => {
    set({ orders: get().orders.map(o => o.id === orderId ? { ...o, status } : o) });
    api.updateOrderStatus(orderId, status).catch(() => {});
  },

  updateProduct: (id, data) => {
    set({ products: get().products.map(p => p.id === id ? { ...p, ...data } : p) });
    api.updateProduct(id, data).catch(() => {});
  },

  addProduct: (product) => {
    set({ products: [...get().products, product] });
    api.createProduct(product).catch(() => {});
  },

  deleteProduct: (id) => {
    set({ products: get().products.filter(p => p.id !== id) });
    api.deleteProduct(id).catch(() => {});
  },
}));
