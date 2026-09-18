import { pgTable, uuid, varchar, text, boolean, integer, numeric, jsonb, timestamp, index, uniqueIndex, AnyPgColumn } from 'drizzle-orm/pg-core';

// ==================== CATEGORIES TABLE ====================
export const categories = pgTable('categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  description: text('description'),
  thumbnail_image: varchar('thumbnail_image', { length: 500 }), // Sub-category ke liye chhoti image
  banner_image: varchar('banner_image', { length: 500 }), // Main category ke liye badi image (mega menu right side)
  parent_id: uuid('parent_id'), // Self-referencing foreign key
  is_main_category: boolean('is_main_category').notNull().default(false),
  display_order: integer('display_order').notNull().default(0),
  product_count: integer('product_count').notNull().default(0), // Cached count for performance
  is_featured_in_focus: boolean('is_featured_in_focus').notNull().default(false), // Collections in Focus section mein dikhana hai ya nahi
  display_order_in_focus: integer('display_order_in_focus'), // Collections in Focus mein order (1-4)
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table: any) => ({
  slugIdx: uniqueIndex('categories_slug_idx').on(table.slug),
  parentIdx: index('categories_parent_idx').on(table.parent_id),
  isMainIdx: index('categories_is_main_idx').on(table.is_main_category),
  displayOrderIdx: index('categories_display_order_idx').on(table.display_order),
  featuredInFocusIdx: index('categories_featured_in_focus_idx').on(table.is_featured_in_focus),
}));

// ==================== USERS TABLE ====================
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 20 }),
  password_hash: varchar('password_hash', { length: 255 }),
  role: varchar('role', { length: 20 }).notNull().default('customer'), // 'customer' | 'admin'
  is_verified: boolean('is_verified').notNull().default(false),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table: any) => ({
  emailIdx: uniqueIndex('users_email_idx').on(table.email),
  roleIdx: index('users_role_idx').on(table.role),
}));

// ==================== OTP VERIFICATIONS TABLE ====================
export const otpVerifications = pgTable('otp_verifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull(),
  otp_code: varchar('otp_code', { length: 6 }).notNull(),
  purpose: varchar('purpose', { length: 50 }).notNull(), // 'checkout', 'signup', 'password_reset'
  is_used: boolean('is_used').notNull().default(false),
  expires_at: timestamp('expires_at', { withTimezone: true }).notNull(),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table: any) => ({
  emailIdx: index('otp_email_idx').on(table.email),
  expiresIdx: index('otp_expires_idx').on(table.expires_at),
}));

// ==================== ADDRESSES TABLE ====================
export const addresses = pgTable('addresses', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: uuid('user_id').references((): AnyPgColumn => users.id),
  name: varchar('name', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 20 }).notNull(),
  address_line_1: varchar('address_line_1', { length: 500 }).notNull(),
  address_line_2: varchar('address_line_2', { length: 500 }),
  city: varchar('city', { length: 100 }).notNull(),
  postal_code: varchar('postal_code', { length: 20 }).notNull(),
  country: varchar('country', { length: 100 }).notNull().default('Pakistan'),
  is_default: boolean('is_default').notNull().default(false),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table: any) => ({
  userIdx: index('addresses_user_idx').on(table.user_id),
}));

// ==================== ORDERS TABLE ====================
export const orders = pgTable('orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  order_number: varchar('order_number', { length: 50 }).notNull().unique(),
  tracking_id: varchar('tracking_id', { length: 50 }).notNull().unique(),
  user_id: uuid('user_id').references((): AnyPgColumn => users.id),
  
  // Customer Info
  customer_email: varchar('customer_email', { length: 255 }).notNull(),
  customer_name: varchar('customer_name', { length: 255 }).notNull(),
  customer_phone: varchar('customer_phone', { length: 20 }).notNull(),
  
  // Shipping Address
  shipping_name: varchar('shipping_name', { length: 255 }).notNull(),
  shipping_phone: varchar('shipping_phone', { length: 20 }).notNull(),
  shipping_address_line_1: varchar('shipping_address_line_1', { length: 500 }).notNull(),
  shipping_address_line_2: varchar('shipping_address_line_2', { length: 500 }),
  shipping_city: varchar('shipping_city', { length: 100 }).notNull(),
  shipping_postal_code: varchar('shipping_postal_code', { length: 20 }).notNull(),
  shipping_country: varchar('shipping_country', { length: 100 }).notNull().default('Pakistan'),
  
  // Billing Address
  billing_name: varchar('billing_name', { length: 255 }).notNull(),
  billing_phone: varchar('billing_phone', { length: 20 }).notNull(),
  billing_address_line_1: varchar('billing_address_line_1', { length: 500 }).notNull(),
  billing_address_line_2: varchar('billing_address_line_2', { length: 500 }),
  billing_city: varchar('billing_city', { length: 100 }).notNull(),
  billing_postal_code: varchar('billing_postal_code', { length: 20 }).notNull(),
  billing_country: varchar('billing_country', { length: 100 }).notNull().default('Pakistan'),
  
  // Order Details
  items: jsonb('items').notNull(), // Array of {product_id, name, image, quantity, size, color, price}
  subtotal: numeric('subtotal', { precision: 10, scale: 2 }).notNull(),
  shipping_method: varchar('shipping_method', { length: 50 }).notNull(), // 'standard' | 'express'
  shipping_cost: numeric('shipping_cost', { precision: 10, scale: 2 }).notNull(),
  discount: numeric('discount', { precision: 10, scale: 2 }).notNull().default('0'),
  coupon_code: varchar('coupon_code', { length: 50 }),
  total: numeric('total', { precision: 10, scale: 2 }).notNull(),
  
  // Status
  payment_method: varchar('payment_method', { length: 50 }).notNull(), // 'cod' | 'online'
  payment_status: varchar('payment_status', { length: 50 }).notNull().default('unpaid'), // 'paid' | 'unpaid'
  order_status: varchar('order_status', { length: 50 }).notNull().default('pending'), // 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  
  // Notes
  order_notes: text('order_notes'),
  
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table: any) => ({
  orderNumberIdx: uniqueIndex('orders_order_number_idx').on(table.order_number),
  trackingIdIdx: uniqueIndex('orders_tracking_id_idx').on(table.tracking_id),
  userIdx: index('orders_user_idx').on(table.user_id),
  statusIdx: index('orders_status_idx').on(table.order_status),
}));

// ==================== WISHLIST TABLE ====================
export const wishlist = pgTable('wishlist', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: uuid('user_id').references((): AnyPgColumn => users.id).notNull(),
  product_id: uuid('product_id').references((): AnyPgColumn => products.id).notNull(),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table: any) => ({
  userIdx: index('wishlist_user_idx').on(table.user_id),
  uniqueIdx: uniqueIndex('wishlist_unique_idx').on(table.user_id, table.product_id),
}));

// ==================== CITIES TABLE ====================
export const cities = pgTable('cities', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(),
  province: varchar('province', { length: 100 }),
  is_active: boolean('is_active').notNull().default(true),
}, (table: any) => ({
  nameIdx: index('cities_name_idx').on(table.name),
}));

// ==================== PRODUCTS TABLE ====================
export const products = pgTable('products', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  description: text('description'),
  actual_price: numeric('actual_price', { precision: 10, scale: 2 }).notNull(),
  compare_price: numeric('compare_price', { precision: 10, scale: 2 }),
  images: jsonb('images').default([]),
  thumbnail_image: varchar('thumbnail_image', { length: 500 }).notNull(),
  main_category_id: uuid('main_category_id').references((): AnyPgColumn => categories.id),
  sub_category_id: uuid('sub_category_id').references((): AnyPgColumn => categories.id),
  
  // Variants
  sizes: jsonb('sizes').default([]),
  colors: jsonb('colors').default([]),
  
  // Badges
  badge_type: varchar('badge_type', { length: 50 }), // "on_sale", "best_seller", "new_arrival", "featured"
  badge_text: varchar('badge_text', { length: 100 }),
  
  // Flags
  is_new_arrival: boolean('is_new_arrival').notNull().default(false),
  is_best_seller: boolean('is_best_seller').notNull().default(false),
  is_featured: boolean('is_featured').notNull().default(false),
  is_in_stock: boolean('is_in_stock').notNull().default(true),
  
  // Inventory
  stock: integer('stock').notNull().default(0),
  sku: varchar('sku', { length: 100 }),
  
  display_order: integer('display_order').notNull().default(0),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table: any) => ({
  slugIdx: uniqueIndex('products_slug_idx').on(table.slug),
  mainCategoryIdx: index('products_main_category_idx').on(table.main_category_id),
  subCategoryIdx: index('products_sub_category_idx').on(table.sub_category_id),
  featuredIdx: index('products_featured_idx').on(table.is_featured),
  newArrivalIdx: index('products_new_arrival_idx').on(table.is_new_arrival),
  bestSellerIdx: index('products_best_seller_idx').on(table.is_best_seller),
  inStockIdx: index('products_in_stock_idx').on(table.is_in_stock),
}));
