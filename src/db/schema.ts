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
