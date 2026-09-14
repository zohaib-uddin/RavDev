import { pgTable, uuid, varchar, text, boolean, integer, numeric, jsonb, timestamp, index, uniqueIndex } from 'drizzle-orm/pg-core';

// Users Table
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 100 }),
  phone: varchar('phone', { length: 20 }),
  role: varchar('role', { length: 20 }).notNull().default('customer'),
  is_verified: boolean('is_verified').notNull().default(false),
  is_active: boolean('is_active').notNull().default(true),
  password: varchar('password', { length: 255 }),
  last_login: timestamp('last_login', { withTimezone: true }),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  emailIdx: index('idx_users_email').on(table.email),
  roleIdx: index('idx_users_role').on(table.role),
}));

// Categories Table
export const categories = pgTable('categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(),
  slug: varchar('slug', { length: 120 }).notNull().unique(),
  parent_id: uuid('parent_id'),
  description: text('description'),
  sort_order: integer('sort_order').notNull().default(0),
  is_active: boolean('is_active').notNull().default(true),
  cover_image_url: varchar('cover_image_url', { length: 500 }),
  tag: varchar('tag', { length: 100 }),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  slugIdx: index('idx_categories_slug').on(table.slug),
  activeIdx: index('idx_categories_active').on(table.is_active),
}));

// Products Table
export const products = pgTable('products', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 200 }).notNull(),
  slug: varchar('slug', { length: 220 }).notNull().unique(),
  description: text('description'),
  base_price: numeric('base_price', { precision: 10, scale: 2 }).notNull(),
  compare_at_price: numeric('compare_at_price', { precision: 10, scale: 2 }),
  is_active: boolean('is_active').notNull().default(true),
  category_id: uuid('category_id'),
  brand: varchar('brand', { length: 100 }).default('RAVENZA'),
  fabric: varchar('fabric', { length: 200 }),
  fit: varchar('fit', { length: 100 }),
  sku: varchar('sku', { length: 100 }),
  cost_price: numeric('cost_price', { precision: 10, scale: 2 }),
  track_inventory: boolean('track_inventory').default(true),
  low_stock_threshold: integer('low_stock_threshold').default(4),
  meta_title: varchar('meta_title', { length: 255 }),
  meta_description: text('meta_description'),
  url_handle: varchar('url_handle', { length: 255 }),
  is_new_arrival: boolean('is_new_arrival').default(false),
  is_bestseller: boolean('is_bestseller').default(false),
  is_featured: boolean('is_featured').notNull().default(false),
  is_best_seller: boolean('is_best_seller').notNull().default(false),
  focus_keywords: text('focus_keywords'),
  robots_index: boolean('robots_index').notNull().default(true),
  badge: varchar('badge', { length: 50 }),
  meta_keywords: text('meta_keywords'),
  shipping_info: text('shipping_info'),
  garment_care: text('garment_care'),
  status: varchar('status', { length: 20 }).notNull().default('active'),
  is_draft: boolean('is_draft').default(false),
  is_spotlight: boolean('is_spotlight').default(false),
  attributes: jsonb('attributes').default({ sizes: ['S', 'M', 'L', 'XL'], colors: ['Black'] }),
  variants_matrix: jsonb('variants_matrix').default([]),
  images: jsonb('images').default([]),
  image_url: varchar('image_url', { length: 1000 }),
  fabric_finish: text('fabric_finish'),
  graphic_print: text('graphic_print'),
  garment_specs: text('garment_specs'),
  fabric_composition: text('fabric_composition'),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  slugIdx: index('idx_products_slug').on(table.slug),
  categoryIdx: index('idx_products_category').on(table.category_id),
  activeIdx: index('idx_products_active').on(table.is_active),
  newArrivalIdx: index('idx_products_new_arrival').on(table.is_new_arrival),
  bestsellerIdx: index('idx_products_bestseller').on(table.is_bestseller),
  featuredIdx: index('idx_products_featured').on(table.is_featured),
}));

// Orders Table
export const orders = pgTable('orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  order_number: varchar('order_number', { length: 20 }).notNull().unique(),
  user_id: uuid('user_id'),
  status: varchar('status', { length: 30 }).notNull().default('pending_verification'),
  subtotal: numeric('subtotal', { precision: 10, scale: 2 }).notNull(),
  shipping_cost: numeric('shipping_cost', { precision: 10, scale: 2 }).notNull().default('0'),
  total: numeric('total', { precision: 10, scale: 2 }).notNull(),
  shipping_address: jsonb('shipping_address').notNull(),
  notes: text('notes'),
  discount_amount: numeric('discount_amount', { precision: 10, scale: 2 }).notNull().default('0'),
  discount_code: varchar('discount_code', { length: 50 }),
  tracking_number: varchar('tracking_number', { length: 100 }),
  email_status: varchar('email_status', { length: 30 }).notNull().default('pending'),
  timeline: jsonb('timeline').default([]),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  orderNumberIdx: index('idx_orders_number').on(table.order_number),
  userIdx: index('idx_orders_user').on(table.user_id),
  statusIdx: index('idx_orders_status').on(table.status),
}));

// Order Items Table
export const order_items = pgTable('order_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  order_id: uuid('order_id').notNull(),
  product_id: uuid('product_id').notNull(),
  product_name: varchar('product_name', { length: 200 }),
  variant_id: uuid('variant_id'),
  quantity: integer('quantity').notNull(),
  unit_price: numeric('unit_price', { precision: 10, scale: 2 }).notNull(),
  total_price: numeric('total_price', { precision: 10, scale: 2 }),
  sku: varchar('sku', { length: 50 }),
  size: varchar('size', { length: 20 }),
  color: varchar('color', { length: 50 }),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  orderIdIdx: index('idx_order_items_order').on(table.order_id),
}));

// Carts Table
export const carts = pgTable('carts', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: uuid('user_id').notNull().unique(),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  userIdx: index('idx_carts_user_id').on(table.user_id),
}));

// Cart Items Table
export const cart_items = pgTable('cart_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  cart_id: uuid('cart_id').notNull(),
  product_id: varchar('product_id', { length: 255 }).notNull(),
  variant_id: varchar('variant_id', { length: 255 }),
  size: varchar('size', { length: 50 }).notNull(),
  color: varchar('color', { length: 100 }).notNull(),
  quantity: integer('quantity').notNull().default(1),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  cartIdIdx: index('idx_cart_items_cart_id').on(table.cart_id),
  productIdIdx: index('idx_cart_items_product_id').on(table.product_id),
}));

// Reviews Table
export const reviews = pgTable('reviews', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: uuid('user_id').notNull(),
  product_id: uuid('product_id').notNull(),
  rating: integer('rating').notNull(),
  comment: text('comment'),
  is_approved: boolean('is_approved').notNull().default(false),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// Wishlists Table
export const wishlists = pgTable('wishlists', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: uuid('user_id').notNull(),
  product_id: varchar('product_id', { length: 255 }).notNull(),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  userIdx: index('idx_wishlists_user_id').on(table.user_id),
  productIdIdx: index('idx_wishlists_product_id').on(table.product_id),
  uniqueIdx: uniqueIndex('unique_user_product_wishlist').on(table.user_id, table.product_id),
}));

// Discounts Table
export const discounts = pgTable('discounts', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: varchar('code', { length: 50 }).notNull().unique(),
  type: varchar('type', { length: 20 }).notNull().default('percentage'),
  value: numeric('value', { precision: 10, scale: 2 }).notNull(),
  min_purchase: numeric('min_purchase', { precision: 10, scale: 2 }),
  max_uses: integer('max_uses'),
  used_count: integer('used_count').notNull().default(0),
  starts_at: timestamp('starts_at', { withTimezone: true }),
  ends_at: timestamp('ends_at', { withTimezone: true }),
  applies_to: jsonb('applies_to'),
  is_active: boolean('is_active').notNull().default(true),
  rules: jsonb('rules').default({}),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  deleted_at: timestamp('deleted_at', { withTimezone: true }),
}, (table) => ({
  codeIdx: index('idx_discounts_code').on(table.code),
}));

// Audit Logs Table
export const audit_logs = pgTable('audit_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  entity_type: varchar('entity_type', { length: 50 }).notNull(),
  entity_id: varchar('entity_id', { length: 100 }).notNull(),
  action: varchar('action', { length: 50 }).notNull(),
  performed_by: varchar('performed_by', { length: 100 }),
  changes: jsonb('changes').default({}),
  ip_address: varchar('ip_address', { length: 50 }),
  user_agent: varchar('user_agent', { length: 500 }),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  entityIdx: index('idx_audit_entity').on(table.entity_type, table.entity_id),
  createdIdx: index('idx_audit_created').on(table.created_at),
}));
