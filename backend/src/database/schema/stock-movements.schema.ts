import { pgTable, uuid, integer, varchar, timestamp, index } from 'drizzle-orm/pg-core';
import { movementTypeEnum } from './enums.schema';
import { products } from './products.schema';
import { users } from './users.schema';

export const stockMovements = pgTable('stock_movements', {
  id: uuid('id').defaultRandom().primaryKey(),
  productId: uuid('product_id').references(() => products.id).notNull(),
  quantityChanged: integer('quantity_changed').notNull(),
  movementType: movementTypeEnum('movement_type').notNull(),
  reason: varchar('reason', { length: 200 }).notNull(),
  createdBy: uuid('created_by').references(() => users.id),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  productIdx: index('stock_movements_product_idx').on(table.productId),
}));