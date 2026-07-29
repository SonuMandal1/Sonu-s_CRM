import { pgTable, uuid, varchar, integer, numeric, timestamp, index } from 'drizzle-orm/pg-core';
import { challanStatusEnum } from './enums.schema';
import { customers } from './customers.schema';
import { products } from './products.schema';
import { users } from './users.schema';
import { pgSequence } from 'drizzle-orm/pg-core';

export const challanNumberSeq = pgSequence('challan_number_seq', { startWith: 1, increment: 1 });

export const salesChallans = pgTable('sales_challans', {
  id: uuid('id').defaultRandom().primaryKey(),
  challanNumber: varchar('challan_number', { length: 40 }).notNull().unique(),
  customerId: uuid('customer_id').references(() => customers.id).notNull(),
  totalQuantity: integer('total_quantity').notNull().default(0),
  status: challanStatusEnum('status').notNull().default('draft'),
  createdBy: uuid('created_by').references(() => users.id),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  customerIdx: index('challans_customer_idx').on(table.customerId),
  statusIdx: index('challans_status_idx').on(table.status),
}));

// snapshot data — do NOT join to live product price/name at read time
export const challanItems = pgTable('challan_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  challanId: uuid('challan_id').references(() => salesChallans.id, { onDelete: 'cascade' }).notNull(),
  productId: uuid('product_id').references(() => products.id),
  productNameSnapshot: varchar('product_name_snapshot', { length: 150 }).notNull(),
  skuSnapshot: varchar('sku_snapshot', { length: 60 }).notNull(),
  unitPriceSnapshot: numeric('unit_price_snapshot', { precision: 12, scale: 2 }).notNull(),
  quantity: integer('quantity').notNull(),
}, (table) => ({
  challanIdx: index('challan_items_challan_idx').on(table.challanId),
}));