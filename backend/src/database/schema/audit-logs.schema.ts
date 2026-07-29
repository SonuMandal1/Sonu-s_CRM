import { pgTable, uuid, varchar, jsonb, timestamp } from 'drizzle-orm/pg-core';
import { users } from './users.schema';

export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  tableName: varchar('table_name', { length: 60 }).notNull(),
  recordId: uuid('record_id').notNull(),
  action: varchar('action', { length: 20 }).notNull(), // create | update | delete
  changedBy: uuid('changed_by').references(() => users.id),
  changes: jsonb('changes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});