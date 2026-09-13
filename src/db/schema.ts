// Drizzle Schema for Neon DB - Ravenza E-Commerce
// This mirrors the actual database schema

export interface User {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  role: 'customer' | 'admin';
  is_verified: boolean;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  last_login: string | null;
}

export interface AdminUser {
  id: string;
  user_id: string;
  permissions: Record<string, boolean>;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  description: string | null;
  sort_order: number;
  created_at: string;
  is_active: boolean;
  updated_at: string;
  cover_image_url: string | null;
  tag: string | null;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  base_price: number;
  compare_at_price: number | null;
  is_active: boolean;
  category_id: string | null;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
  subcategory_id: string | null;
  brand: string;
  fabric: string | null;
  fit: string | null;
  sku: string | null;
  cost_price: number | null;
  track_inventory: boolean;
  low_stock_threshold: number;
  meta_title: string | null;
  meta_description: string | null;
  url_handle: string | null;
  subcategory_name: string | null;
  is_new_arrival: boolean;
  is_bestseller: boolean;
  is_featured: boolean;
  is_best_seller: boolean;
  canonical_url: string | null;
  focus_keywords: string | null;
  robots_index: boolean;
  chapter_campaign_edition: string | null;
  size_guide: any[];
  badge: string | null;
  is_warm_chapter_1: boolean;
  meta_keywords: string | null;
  cloudinary_image_id: string | null;
  shipping_info: string | null;
  garment_care: string | null;
  status: string;
  is_draft: boolean;
  is_spotlight: boolean;
  is_placement_grid: boolean;
  model_size: string | null;
  shipping_delivery: string | null;
  attributes: { sizes: string[]; colors: string[] };
  variants_matrix: any[];
  images: string[];
  image_url: string | null;
  fabric_finish: string | null;
  graphic_print: string | null;
  garment_specs: string | null;
  fabric_composition: string | null;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  sku: string;
  size: string | null;
  color: string | null;
  price_override: number | null;
  stock_quantity: number;
  image_url: string | null;
  created_at: string;
  reorder_point: number;
  version: number;
  cost_price: number;
  color_hex: string | null;
  color_code: string | null;
}

export interface Collection {
  id: string;
  name: string;
  slug: string;
  type: 'manual' | 'automated';
  rules: any;
  cover_image_url: string | null;
  is_active: boolean;
  created_at: string;
  sort_order: number;
  updated_at: string;
  rules_match: string;
  show_on_home_chapter: boolean;
  chapter_title: string;
  edition_name: string;
  show_in_focus: boolean;
  show_explore_banner: boolean;
  explore_title: string | null;
  description: string | null;
}

export interface Order {
  id: string;
  order_number: string;
  user_id: string | null;
  status: 'pending_verification' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  subtotal: number;
  shipping_cost: number;
  total: number;
  shipping_address: Record<string, any>;
  notes: string | null;
  created_at: string;
  updated_at: string;
  discount_amount: number;
  discount_code: string | null;
  tracking_number: string | null;
  invoice_url: string | null;
  cancellation_reason: string | null;
  email_status: string;
  timeline: any[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  variant_id: string | null;
  quantity: number;
  unit_price: number;
  created_at: string;
  product_name: string | null;
  sku: string | null;
  size: string | null;
  color: string | null;
  total_price: number | null;
}

export interface Cart {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  id: string;
  cart_id: string;
  product_id: string;
  variant_id: string | null;
  size: string;
  color: string;
  quantity: number;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  user_id: string;
  product_id: string;
  rating: number;
  comment: string | null;
  is_approved: boolean;
  created_at: string;
}

export interface Wishlist {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
}

export interface Discount {
  id: string;
  code: string;
  type: 'percentage' | 'fixed' | 'bogo';
  value: number;
  min_purchase: number | null;
  max_uses: number | null;
  used_count: number;
  starts_at: string | null;
  ends_at: string | null;
  applies_to: any;
  created_at: string;
  is_active: boolean;
  rules: Record<string, any>;
  deleted_at: string | null;
}

export interface AuditLog {
  id: string;
  entity_type: string;
  entity_id: string;
  action: string;
  performed_by: string | null;
  changes: Record<string, any>;
  ip_address: string | null;
  created_at: string;
  user_agent: string | null;
}
