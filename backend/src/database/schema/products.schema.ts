import { pgTable, uuid, varchar, integer, numeric, timestamp, index } from 'drizzle-orm/pg-core';
import { warehouses } from './warehouses.schema';
import { users } from './users.schema';

export const categories = pgTable('categories', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 100 }).notNull().unique(),
});

export const products = pgTable('products', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 150 }).notNull(),
  sku: varchar('sku', { length: 60 }).notNull().unique(),
  categoryId: uuid('category_id').references(() => categories.id),
  unitPrice: numeric('unit_price', { precision: 12, scale: 2 }).notNull(),
  currentStock: integer('current_stock').notNull().default(0),
  minStockAlert: integer('min_stock_alert').notNull().default(0),
  warehouseId: uuid('warehouse_id').references(() => warehouses.id),
  createdBy: uuid('created_by').references(() => users.id),
  updatedBy: uuid('updated_by').references(() => users.id),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
}, (table) => ({
  skuIdx: index('products_sku_idx').on(table.sku),
  stockIdx: index('products_stock_idx').on(table.currentStock),
}));