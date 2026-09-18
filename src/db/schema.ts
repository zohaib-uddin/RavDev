import { pgTable, uuid, varchar, text, boolean, integer, timestamp, index, uniqueIndex, AnyPgColumn } from 'drizzle-orm/pg-core';

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
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table: any) => ({
  slugIdx: uniqueIndex('categories_slug_idx').on(table.slug),
  parentIdx: index('categories_parent_idx').on(table.parent_id),
  isMainIdx: index('categories_is_main_idx').on(table.is_main_category),
  displayOrderIdx: index('categories_display_order_idx').on(table.display_order),
}));

// ==================== PRODUCTS TABLE ====================
export const products = pgTable('products', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  description: text('description'),
  price: varchar('price', { length: 20 }).notNull(),
  thumbnail_image: varchar('thumbnail_image', { length: 500 }).notNull(),
  main_category_id: uuid('main_category_id').references((): AnyPgColumn => categories.id),
  sub_category_id: uuid('sub_category_id').references((): AnyPgColumn => categories.id),
  is_featured: boolean('is_featured').notNull().default(false), // Mega menu mein dikhane ke liye
  display_order: integer('display_order').notNull().default(0),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table: any) => ({
  slugIdx: uniqueIndex('products_slug_idx').on(table.slug),
  mainCategoryIdx: index('products_main_category_idx').on(table.main_category_id),
  subCategoryIdx: index('products_sub_category_idx').on(table.sub_category_id),
  featuredIdx: index('products_featured_idx').on(table.is_featured),
}));
