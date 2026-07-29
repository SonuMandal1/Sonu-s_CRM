import { pgTable, uuid, varchar, text, timestamp, date, index } from 'drizzle-orm/pg-core';
import { customerTypeEnum, customerStatusEnum } from './enums.schema';
import { users } from './users.schema';

export const customers = pgTable('customers', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 150 }).notNull(),
  mobile: varchar('mobile', { length: 20 }).notNull(),
  email: varchar('email', { length: 160 }),
  businessName: varchar('business_name', { length: 180 }),
  gstNumber: varchar('gst_number', { length: 20 }),
  customerType: customerTypeEnum('customer_type').notNull().default('retail'),
  address: text('address'),
  status: customerStatusEnum('status').notNull().default('lead'),
  followUpDate: date('follow_up_date'),
  notes: text('notes'),
  createdBy: uuid('created_by').references(() => users.id),
  updatedBy: uuid('updated_by').references(() => users.id),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
}, (table) => ({
  mobileIdx: index('customers_mobile_idx').on(table.mobile),
  nameIdx: index('customers_name_idx').on(table.name),
  statusIdx: index('customers_status_idx').on(table.status),
}));

export const customerFollowups = pgTable('customer_followups', {
  id: uuid('id').defaultRandom().primaryKey(),
  customerId: uuid('customer_id').references(() => customers.id, { onDelete: 'cascade' }).notNull(),
  note: text('note').notNull(),
  followUpDate: date('follow_up_date'),
  createdBy: uuid('created_by').references(() => users.id),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  customerIdx: index('followups_customer_idx').on(table.customerId),
}));