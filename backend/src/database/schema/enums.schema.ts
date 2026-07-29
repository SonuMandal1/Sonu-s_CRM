import { pgEnum } from 'drizzle-orm/pg-core';

export const roleEnum = pgEnum('role', ['admin', 'sales', 'warehouse', 'accounts']);
export const customerTypeEnum = pgEnum('customer_type', ['retail', 'wholesale', 'distributor']);
export const customerStatusEnum = pgEnum('customer_status', ['lead', 'active', 'inactive']);
export const movementTypeEnum = pgEnum('movement_type', ['in', 'out']);
export const challanStatusEnum = pgEnum('challan_status', ['draft', 'confirmed', 'cancelled']);