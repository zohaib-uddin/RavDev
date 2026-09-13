import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../services/api';

// Types matching Neon DB Schema
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
  is_warm_chapter_1: boolean;
  images: string[];
  image_url: string | null;
  attributes: { sizes: string[]; colors: string[] };
  variants_matrix: any[];
  fabric_finish: string | null;
  graphic_print: string | null;
  garment_specs: string | null;
  fabric_composition: string | null;
  shipping_info: string | null;
  garment_care: string | null;
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
  status: 'pending_verification' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  date: string;
  address: Record<string, any>;
  tracking_number?: string;
  discount_code?: string;
  discount_amount?: number;
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

// Helper to convert DB product to frontend format
const mapProduct = (p: any): Product => ({
  ...p,
  price: p.base_price,
  salePrice: p.compare_at_price ? p.base_price : undefined,
  image: p.image_url || p.images?.[0] || '',
  sizes: p.attributes?.sizes || ['S', 'M', 'L', 'XL'],
  colors: p.attributes?.colors || ['Black'],
  stockCount: p.variants_matrix?.reduce((sum: number, v: any) => sum + (v.stock || 0), 0) || 50,
  inStock: true,
  isNew: p.is_new_arrival,
  isFeatured: p.is_featured,
  isBestseller: p.is_bestseller || p.is_best_seller,
  details: [
    p.fabric_composition && `${p.fabric_composition}`,
    p.fit && `Fit: ${p.fit}`,
    p.graphic_print && `Print: ${p.graphic_print}`,
    p.garment_specs,
    p.garment_care && `Care: ${p.garment_care}`,
    'Made in Pakistan',
  ].filter(Boolean) as string[],
  material: p.fabric_composition || p.fabric || 'Premium Cotton',
  category: p.category_slug || 'oversize-tees',
});

// Demo data for when API is unavailable
const demoProducts: Product[] = [
  {
    id: '1', name: 'Shadow Realm Co-Ord Set', slug: 'shadow-realm-co-ord', description: 'Premium cotton co-ord set with shadow realm graphic print.', base_price: 4500, compare_at_price: 3990, is_active: true, category_id: '1', category_slug: 'co-ord-sets', category_name: 'Co-Ord Sets', brand: 'RAVENZA', fabric: '100% Cotton', fit: 'Oversized', sku: 'RVZ-CO-001', is_new_arrival: true, is_bestseller: true, is_featured: true, is_best_seller: true, badge: 'NEW', is_warm_chapter_1: true, images: ['https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&h=750&fit=crop', 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600&h=750&fit=crop', 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&h=750&fit=crop'], image_url: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&h=750&fit=crop', attributes: { sizes: ['S', 'M', 'L', 'XL'], colors: ['Black', 'Charcoal'] }, variants_matrix: [], fabric_finish: 'Matte', graphic_print: 'Shadow Realm Screen Print', garment_specs: '260 GSM', fabric_composition: '100% Premium Cotton', shipping_info: 'Free shipping above Rs.3000', garment_care: 'Machine wash cold', meta_title: null, meta_description: null, focus_keywords: null, status: 'active', is_draft: false, created_at: '2024-01-15', updated_at: '2024-01-15', price: 4500, salePrice: 3990, image: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&h=750&fit=crop', sizes: ['S', 'M', 'L', 'XL'], colors: ['Black', 'Charcoal'], stockCount: 45, inStock: true, isNew: true, isFeatured: true, isBestseller: true, details: ['100% Premium Cotton', 'Oversized Relaxed Fit', 'Screen Printed Graphics', 'Elastic Waistband', 'Side Pockets', 'Machine Washable'], material: '100% Cotton', category: 'co-ord-sets',
  },
  {
    id: '2', name: 'Acid Wash Phantom Tee', slug: 'acid-wash-phantom', description: 'Authentic acid wash oversized tee with phantom graphic.', base_price: 2800, compare_at_price: 2499, is_active: true, category_id: '2', category_slug: 'oversize-tees', category_name: 'Oversize Tees', brand: 'RAVENZA', fabric: 'Acid Wash Cotton', fit: 'Oversized', sku: 'RVZ-TS-002', is_new_arrival: true, is_bestseller: true, is_featured: true, is_best_seller: true, badge: 'BESTSELLER', is_warm_chapter_1: false, images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=750&fit=crop', 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&h=750&fit=crop', 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&h=750&fit=crop'], image_url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=750&fit=crop', attributes: { sizes: ['S', 'M', 'L', 'XL', '2XL'], colors: ['Smoky Black', 'Faded Teal', 'Dusty Mocha'] }, variants_matrix: [], fabric_finish: 'Acid Washed', graphic_print: 'Phantom Back Print', garment_specs: '240 GSM', fabric_composition: 'Acid Wash Cotton', shipping_info: 'Free shipping above Rs.3000', garment_care: 'Wash separately, cold', meta_title: null, meta_description: null, focus_keywords: null, status: 'active', is_draft: false, created_at: '2024-01-20', updated_at: '2024-01-20', price: 2800, salePrice: 2499, image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=750&fit=crop', sizes: ['S', 'M', 'L', 'XL', '2XL'], colors: ['Smoky Black', 'Faded Teal', 'Dusty Mocha'], stockCount: 80, inStock: true, isNew: true, isFeatured: true, isBestseller: true, details: ['Acid Washed Fabric', 'Drop Shoulder Design', 'Ribbed Neckline', 'Premium GSM 240', 'Unisex Fit', 'Pre-Shrunk'], material: 'Acid Wash Cotton', category: 'oversize-tees',
  },
  {
    id: '3', name: 'Wide Leg Graphic Trouser', slug: 'wide-leg-graphic', description: 'Premium wide leg trouser with signature graphic print.', base_price: 3200, compare_at_price: 2890, is_active: true, category_id: '3', category_slug: 'graphic-trousers', category_name: 'Graphic Trousers', brand: 'RAVENZA', fabric: 'Premium Twill', fit: 'Wide Leg', sku: 'RVZ-TR-003', is_new_arrival: false, is_bestseller: true, is_featured: true, is_best_seller: true, badge: null, is_warm_chapter_1: true, images: ['https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&h=750&fit=crop', 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&h=750&fit=crop', 'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=600&h=750&fit=crop'], image_url: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&h=750&fit=crop', attributes: { sizes: ['S', 'M', 'L', 'XL'], colors: ['Black', 'Navy'] }, variants_matrix: [], fabric_finish: 'Matte Twill', graphic_print: 'All-Over Graphic', garment_specs: '280 GSM', fabric_composition: 'Premium Twill Cotton', shipping_info: 'Free shipping above Rs.3000', garment_care: 'Machine wash cold', meta_title: null, meta_description: null, focus_keywords: null, status: 'active', is_draft: false, created_at: '2024-02-01', updated_at: '2024-02-01', price: 3200, salePrice: 2890, image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&h=750&fit=crop', sizes: ['S', 'M', 'L', 'XL'], colors: ['Black', 'Navy'], stockCount: 60, inStock: true, isNew: false, isFeatured: true, isBestseller: true, details: ['Premium Twill Fabric', 'Wide Leg Silhouette', 'All-Over Graphic Print', 'Elastic + Drawstring Waist', 'Side & Back Pockets', 'Tapered Ankle'], material: 'Premium Twill', category: 'graphic-trousers',
  },
  {
    id: '4', name: 'Urban Drift Trackpants', slug: 'urban-drift-trackpants', description: 'Premium fabric trackpants with relaxed wide-leg fit.', base_price: 2900, compare_at_price: 2599, is_active: true, category_id: '4', category_slug: 'trackpants', category_name: 'Trackpants', brand: 'RAVENZA', fabric: 'French Terry', fit: 'Relaxed', sku: 'RVZ-TP-004', is_new_arrival: false, is_bestseller: false, is_featured: true, is_best_seller: false, badge: null, is_warm_chapter_1: true, images: ['https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=600&h=750&fit=crop', 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=600&h=750&fit=crop'], image_url: 'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=600&h=750&fit=crop', attributes: { sizes: ['S', 'M', 'L', 'XL', '2XL'], colors: ['Black', 'Grey', 'Navy'] }, variants_matrix: [], fabric_finish: 'Brushed Interior', graphic_print: 'Contrast Side Stripe', garment_specs: '320 GSM', fabric_composition: 'French Terry Cotton', shipping_info: 'Free shipping above Rs.3000', garment_care: 'Machine wash cold', meta_title: null, meta_description: null, focus_keywords: null, status: 'active', is_draft: false, created_at: '2024-02-10', updated_at: '2024-02-10', price: 2900, salePrice: 2599, image: 'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=600&h=750&fit=crop', sizes: ['S', 'M', 'L', 'XL', '2XL'], colors: ['Black', 'Grey', 'Navy'], stockCount: 100, inStock: true, isNew: false, isFeatured: true, isBestseller: false, details: ['French Terry Fabric', 'Relaxed Wide Leg', 'Contrast Side Stripe', 'Elastic Waistband', 'Zip Pockets', 'Cuffed Hem'], material: 'French Terry', category: 'trackpants',
  },
  {
    id: '5', name: 'Neon Pulse Graphic Shorts', slug: 'neon-pulse-shorts', description: 'Breathable graphic shorts with signature neon pulse design.', base_price: 2200, compare_at_price: 1990, is_active: true, category_id: '5', category_slug: 'graphic-shorts', category_name: 'Graphic Shorts', brand: 'RAVENZA', fabric: 'Polyester Blend', fit: 'Regular', sku: 'RVZ-SH-005', is_new_arrival: true, is_bestseller: false, is_featured: false, is_best_seller: false, badge: 'NEW', is_warm_chapter_1: false, images: ['https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=600&h=750&fit=crop', 'https://images.unsplash.com/photo-1562157873-818bc0726f38?w=600&h=750&fit=crop'], image_url: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=600&h=750&fit=crop', attributes: { sizes: ['S', 'M', 'L', 'XL'], colors: ['Black', 'White'] }, variants_matrix: [], fabric_finish: 'Smooth', graphic_print: 'Neon Pulse All-Over', garment_specs: '150 GSM', fabric_composition: 'Polyester Mesh Blend', shipping_info: 'Free shipping above Rs.3000', garment_care: 'Machine wash cold', meta_title: null, meta_description: null, focus_keywords: null, status: 'active', is_draft: false, created_at: '2024-03-01', updated_at: '2024-03-01', price: 2200, salePrice: 1990, image: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=600&h=750&fit=crop', sizes: ['S', 'M', 'L', 'XL'], colors: ['Black', 'White'], stockCount: 75, inStock: true, isNew: true, isFeatured: false, isBestseller: false, details: ['Lightweight Mesh Lining', 'All-Over Print', 'Elastic Waistband', 'Side Pockets', 'Above Knee Length', 'Quick Dry Fabric'], material: 'Polyester Blend', category: 'graphic-shorts',
  },
  {
    id: '6', name: 'Midnight Vortex Co-Ord', slug: 'midnight-vortex-coord', description: 'Premium midnight vortex graphic co-ord set.', base_price: 4800, compare_at_price: 4290, is_active: true, category_id: '1', category_slug: 'co-ord-sets', category_name: 'Co-Ord Sets', brand: 'RAVENZA', fabric: 'Cotton Blend', fit: 'Relaxed', sku: 'RVZ-CO-006', is_new_arrival: true, is_bestseller: false, is_featured: true, is_best_seller: false, badge: 'LIMITED', is_warm_chapter_1: true, images: ['https://images.unsplash.com/photo-1578681994506-b8f463449011?w=600&h=750&fit=crop', 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&h=750&fit=crop'], image_url: 'https://images.unsplash.com/photo-1578681994506-b8f463449011?w=600&h=750&fit=crop', attributes: { sizes: ['S', 'M', 'L', 'XL'], colors: ['Black', 'Dark Navy'] }, variants_matrix: [], fabric_finish: 'Soft Touch', graphic_print: 'Vortex Puff Print', garment_specs: '280 GSM', fabric_composition: 'Cotton Blend', shipping_info: 'Free shipping above Rs.3000', garment_care: 'Hand wash recommended', meta_title: null, meta_description: null, focus_keywords: null, status: 'active', is_draft: false, created_at: '2024-03-05', updated_at: '2024-03-05', price: 4800, salePrice: 4290, image: 'https://images.unsplash.com/photo-1578681994506-b8f463449011?w=600&h=750&fit=crop', sizes: ['S', 'M', 'L', 'XL'], colors: ['Black', 'Dark Navy'], stockCount: 35, inStock: true, isNew: true, isFeatured: true, isBestseller: false, details: ['Premium Cotton Blend', 'Matching Top & Bottom', 'Puff Print Graphics', 'Relaxed Fit', 'Elastic Waistband', 'Side Pockets'], material: 'Cotton Blend', category: 'co-ord-sets',
  },
  {
    id: '7', name: 'Reaper X Graphic Co-Ord', slug: 'reaper-x-coord', description: 'Bold reaper graphics on premium cotton.', base_price: 4800, compare_at_price: 4290, is_active: true, category_id: '1', category_slug: 'co-ord-sets', category_name: 'Co-Ord Sets', brand: 'RAVENZA', fabric: 'Premium Cotton', fit: 'Oversized', sku: 'RVZ-CO-007', is_new_arrival: true, is_bestseller: true, is_featured: true, is_best_seller: true, badge: 'HOT', is_warm_chapter_1: true, images: ['https://images.unsplash.com/photo-1578593139862-435adc1d20b8?w=600&h=750&fit=crop', 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&h=750&fit=crop', 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&h=750&fit=crop'], image_url: 'https://images.unsplash.com/photo-1578593139862-435adc1d20b8?w=600&h=750&fit=crop', attributes: { sizes: ['S', 'M', 'L', 'XL'], colors: ['Black', 'Dark Grey'] }, variants_matrix: [], fabric_finish: 'Matte', graphic_print: 'Reaper X All-Over', garment_specs: '260 GSM', fabric_composition: '100% Premium Cotton', shipping_info: 'Free shipping above Rs.3000', garment_care: 'Machine wash cold', meta_title: null, meta_description: null, focus_keywords: null, status: 'active', is_draft: false, created_at: '2024-03-10', updated_at: '2024-03-10', price: 4800, salePrice: 4290, image: 'https://images.unsplash.com/photo-1578593139862-435adc1d20b8?w=600&h=750&fit=crop', sizes: ['S', 'M', 'L', 'XL'], colors: ['Black', 'Dark Grey'], stockCount: 25, inStock: true, isNew: true, isFeatured: true, isBestseller: true, details: ['Premium 260 GSM Cotton', 'All-Over Reaper Graphic', 'Oversized Tee + Wide Trouser', 'Puff Print Details', 'Elastic Waistband', 'Limited Edition'], material: 'Premium Cotton', category: 'co-ord-sets',
  },
  {
    id: '8', name: 'Denim Jacket - Raven Black', slug: 'denim-jacket-raven', description: 'Premium denim jacket with classic fit.', base_price: 3990, compare_at_price: null, is_active: true, category_id: '6', category_slug: 'shirts', category_name: 'Shirts & Jackets', brand: 'RAVENZA', fabric: 'Cotton Denim', fit: 'Classic', sku: 'RVZ-JK-008', is_new_arrival: false, is_bestseller: false, is_featured: true, is_best_seller: false, badge: null, is_warm_chapter_1: false, images: ['https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&h=750&fit=crop', 'https://images.unsplash.com/photo-1578681994506-b8f463449011?w=600&h=750&fit=crop'], image_url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&h=750&fit=crop', attributes: { sizes: ['S', 'M', 'L', 'XL', '2XL'], colors: ['Black', 'Brown', 'Light Blue'] }, variants_matrix: [], fabric_finish: 'Raw Denim', graphic_print: 'Embroidered Logo', garment_specs: '14oz Denim', fabric_composition: '100% Cotton Denim', shipping_info: 'Free shipping above Rs.3000', garment_care: 'Wash inside out', meta_title: null, meta_description: null, focus_keywords: null, status: 'active', is_draft: false, created_at: '2024-03-15', updated_at: '2024-03-15', price: 3990, salePrice: undefined, image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&h=750&fit=crop', sizes: ['S', 'M', 'L', 'XL', '2XL'], colors: ['Black', 'Brown', 'Light Blue'], stockCount: 40, inStock: true, isNew: false, isFeatured: true, isBestseller: false, details: ['100% Cotton Denim', 'Classic Trucker Fit', 'Button Front Closure', 'Chest Pockets', 'Adjustable Cuffs', 'Embroidered Logo'], material: 'Cotton Denim', category: 'shirts',
  },
  {
    id: '9', name: 'Classic Pullover Hoodie', slug: 'classic-pullover-hoodie', description: 'Classic pullover hoodie in premium fleece.', base_price: 2500, compare_at_price: 2240, is_active: true, category_id: '2', category_slug: 'oversize-tees', category_name: 'Oversize Tees', brand: 'RAVENZA', fabric: 'Cotton Fleece', fit: 'Regular', sku: 'RVZ-HD-009', is_new_arrival: false, is_bestseller: false, is_featured: true, is_best_seller: false, badge: null, is_warm_chapter_1: true, images: ['https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&h=750&fit=crop', 'https://images.unsplash.com/photo-1578681994506-b8f463449011?w=600&h=750&fit=crop'], image_url: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&h=750&fit=crop', attributes: { sizes: ['S', 'M', 'L', 'XL', '2XL'], colors: ['Black', 'Grey', 'Navy'] }, variants_matrix: [], fabric_finish: 'Brushed Fleece', graphic_print: 'Chest Embroidery', garment_specs: '350 GSM', fabric_composition: 'Cotton Fleece', shipping_info: 'Free shipping above Rs.3000', garment_care: 'Machine wash cold', meta_title: null, meta_description: null, focus_keywords: null, status: 'active', is_draft: false, created_at: '2024-03-20', updated_at: '2024-03-20', price: 2500, salePrice: 2240, image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&h=750&fit=crop', sizes: ['S', 'M', 'L', 'XL', '2XL'], colors: ['Black', 'Grey', 'Navy'], stockCount: 120, inStock: true, isNew: false, isFeatured: true, isBestseller: false, details: ['350 GSM Fleece', 'Kangaroo Pocket', 'Ribbed Cuffs & Hem', 'Double Layered Hood', 'Embroidered Chest Logo', 'Pre-Shrunk'], material: 'Cotton Fleece', category: 'oversize-tees',
  },
  {
    id: '10', name: 'Varsity Jacket - Mustard', slug: 'varsity-jacket-mustard', description: 'Classic varsity jacket with premium wool body.', base_price: 3000, compare_at_price: 2490, is_active: true, category_id: '6', category_slug: 'shirts', category_name: 'Shirts & Jackets', brand: 'RAVENZA', fabric: 'Wool Blend', fit: 'Regular', sku: 'RVZ-JK-010', is_new_arrival: false, is_bestseller: false, is_featured: true, is_best_seller: false, badge: null, is_warm_chapter_1: false, images: ['https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=600&h=750&fit=crop', 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&h=750&fit=crop'], image_url: 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=600&h=750&fit=crop', attributes: { sizes: ['S', 'M', 'L', 'XL'], colors: ['Mustard', 'Black', 'Navy'] }, variants_matrix: [], fabric_finish: 'Melton Wool', graphic_print: 'Chenille Patch', garment_specs: 'Heavy Weight', fabric_composition: 'Wool Body / Faux Leather Sleeves', shipping_info: 'Free shipping above Rs.3000', garment_care: 'Dry clean only', meta_title: null, meta_description: null, focus_keywords: null, status: 'active', is_draft: false, created_at: '2024-03-25', updated_at: '2024-03-25', price: 3000, salePrice: 2490, image: 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=600&h=750&fit=crop', sizes: ['S', 'M', 'L', 'XL'], colors: ['Mustard', 'Black', 'Navy'], stockCount: 35, inStock: true, isNew: false, isFeatured: true, isBestseller: false, details: ['Wool Blend Body', 'Faux Leather Sleeves', 'Snap Button Closure', 'Ribbed Collar & Cuffs', 'Inner Pockets', 'Chenille Patch Logo'], material: 'Wool Blend', category: 'shirts',
  },
];

const demoCategories: Category[] = [
  { id: '1', name: 'Co-Ord Sets', slug: 'co-ord-sets', description: 'Matching top and bottom sets', cover_image_url: null, is_active: true, sort_order: 1, tag: 'TRENDING' },
  { id: '2', name: 'Oversize Tees', slug: 'oversize-tees', description: 'Oversized t-shirts and hoodies', cover_image_url: null, is_active: true, sort_order: 2, tag: 'POPULAR' },
  { id: '3', name: 'Graphic Trousers', slug: 'graphic-trousers', description: 'Wide leg graphic trousers', cover_image_url: null, is_active: true, sort_order: 3, tag: null },
  { id: '4', name: 'Trackpants', slug: 'trackpants', description: 'Comfortable trackpants', cover_image_url: null, is_active: true, sort_order: 4, tag: 'WARM CHAPTER' },
  { id: '5', name: 'Graphic Shorts', slug: 'graphic-shorts', description: 'Bold graphic shorts', cover_image_url: null, is_active: true, sort_order: 5, tag: 'NEW' },
  { id: '6', name: 'Shirts & Jackets', slug: 'shirts', description: 'Shirts, jackets and outerwear', cover_image_url: null, is_active: true, sort_order: 6, tag: null },
];

const demoReviews: Review[] = [
  { id: '1', product_id: '1', user_id: '1', user_name: 'Ahmed Khan', rating: 5, comment: 'Amazing quality! The fabric is so soft and the fit is perfect.', is_approved: true, date: '2024-01-15' },
  { id: '2', product_id: '2', user_id: '2', user_name: 'Sara Ali', rating: 5, comment: 'Love the acid wash effect. Looks exactly like the photos!', is_approved: true, date: '2024-01-20' },
  { id: '3', product_id: '3', user_id: '3', user_name: 'Bilal Hassan', rating: 5, comment: 'Best wide leg trousers I have ever owned. Premium quality!', is_approved: true, date: '2024-02-01' },
  { id: '4', product_id: '4', user_id: '4', user_name: 'Fatima Zahra', rating: 4, comment: 'Super comfortable and stylish. Will definitely order again.', is_approved: true, date: '2024-02-10' },
  { id: '5', product_id: '7', user_id: '5', user_name: 'Hamza Sheikh', rating: 5, comment: 'The reaper graphic is insane! Got so many compliments.', is_approved: true, date: '2024-03-01' },
  { id: '6', product_id: '8', user_id: '6', user_name: 'Ayesha Tariq', rating: 4, comment: 'Beautiful denim jacket. Fits perfectly and quality is amazing.', is_approved: true, date: '2024-03-05' },
  { id: '7', product_id: '9', user_id: '7', user_name: 'Zain Ali', rating: 5, comment: 'Best hoodie ever. So warm and comfortable. Premium fleece quality.', is_approved: true, date: '2024-03-10' },
  { id: '8', product_id: '6', user_id: '8', user_name: 'Usman Malik', rating: 5, comment: 'Great co-ord set. The graphic is fire 🔥 Quality is top notch.', is_approved: true, date: '2024-03-15' },
];

interface StoreState {
  // Connection
  isConnected: boolean;
  apiAvailable: boolean;
  
  // Auth
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, name: string, password: string) => Promise<boolean>;
  logout: () => void;

  // Cart
  cart: CartItem[];
  addToCart: (product: Product, size: string, color: string) => void;
  removeFromCart: (productId: string, size: string) => void;
  updateCartQuantity: (productId: string, size: string, quantity: number) => void;
  clearCart: () => void;

  // Wishlist
  wishlist: string[];
  toggleWishlist: (productId: string) => void;

  // Data
  products: Product[];
  categories: Category[];
  orders: Order[];
  reviews: Review[];
  isLoading: boolean;
  
  // Actions
  fetchProducts: () => Promise<void>;
  fetchCategories: () => Promise<void>;
  fetchOrders: () => Promise<void>;
  addOrder: (order: Order) => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  updateProduct: (id: string, data: Partial<Product>) => void;
  addProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
}

export const useStore = create<StoreState>()(
  persist<StoreState>(
    (set, get) => ({
      isConnected: false,
      apiAvailable: false,
      user: null,
      cart: [],
      wishlist: [],
      products: demoProducts,
      categories: demoCategories,
      orders: [],
      reviews: demoReviews,
      isLoading: false,

      login: async (email: string, password: string) => {
        // Try API first
        try {
          const result = await api.login(email, password);
          api.setToken(result.token);
          set({ user: result.user, isConnected: true, apiAvailable: true });
          return true;
        } catch {
          // Fallback to demo mode
          if (email === 'admin@ravenza.pk' && password === 'admin123') {
            set({ user: { id: 'admin', email, name: 'Admin', role: 'admin', is_verified: true }, isConnected: true, apiAvailable: false });
            return true;
          }
          if (email && password.length >= 6) {
            set({ user: { id: Date.now().toString(), email, name: email.split('@')[0], role: 'customer', is_verified: true }, isConnected: true, apiAvailable: false });
            return true;
          }
          return false;
        }
      },

      register: async (email: string, name: string, password: string) => {
        try {
          const result = await api.register(email, name, password);
          api.setToken(result.token);
          set({ user: result.user, isConnected: true, apiAvailable: true });
          return true;
        } catch {
          if (email && name && password.length >= 6) {
            set({ user: { id: Date.now().toString(), email, name, role: 'customer', is_verified: false }, isConnected: true, apiAvailable: false });
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
          set({ products: products.map(mapProduct), apiAvailable: true });
        } catch {
          // Keep demo data
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

      addOrder: (order) => set({ orders: [...get().orders, order] }),
      
      updateOrderStatus: (orderId, status) => {
        set({ orders: get().orders.map(o => o.id === orderId ? { ...o, status } : o) });
        // Try to sync with API
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
    }),
    {
      name: 'ravenza-store',
    }
  )
);
