import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { and, eq, desc, sql, SQL, getTableColumns } from 'drizzle-orm';
import { db } from '../../database/db';
import { salesChallans, challanItems, products, stockMovements, customers, users } from '../../database/schema';
import { CreateChallanDto } from './dto/create-challan.dto';
import { QueryChallanDto } from './dto/query-challan.dto';
import { ChallanStatusInput } from './dto/update-challan-status.dto';

@Injectable()
export class ChallansService {
  private async generateChallanNumber(tx: any) {
    const result = await tx.execute(sql`select nextval('challan_number_seq') as val`);
    const val = result.rows[0].val;
    const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    return `CH-${datePart}-${String(val).padStart(5, '0')}`;
  }

  // Draft: snapshot product name/SKU/price at creation time. No stock touched yet.
  async create(dto: CreateChallanDto, userId: string) {
    return db.transaction(async (tx) => {
      const [customer] = await tx.select().from(customers).where(eq(customers.id, dto.customerId)).limit(1);
      if (!customer) throw new NotFoundException('Customer not found');

      const challanNumber = await this.generateChallanNumber(tx);
      let totalQuantity = 0;
      const itemRows: any[] = [];

      for (const item of dto.items) {
        const [product] = await tx.select().from(products).where(eq(products.id, item.productId)).limit(1);
        if (!product) throw new NotFoundException(`Product ${item.productId} not found`);

        totalQuantity += item.quantity;
        itemRows.push({
          productId: product.id,
          productNameSnapshot: product.name,
          skuSnapshot: product.sku,
          unitPriceSnapshot: product.unitPrice,
          quantity: item.quantity,
        });
      }

      const [challan] = await tx
        .insert(salesChallans)
        .values({ challanNumber, customerId: dto.customerId, totalQuantity, status: 'draft', createdBy: userId })
        .returning();

      await tx.insert(challanItems).values(itemRows.map((row) => ({ ...row, challanId: challan.id })));

      return { ...challan, items: itemRows };
    });
  }

  async findAll(query: QueryChallanDto) {
    const { status, customerId, page, limit } = query;
    const offset = (page - 1) * limit;

   const conditions: SQL[] = [];
    if (status) conditions.push(eq(salesChallans.status, status as any));
    if (customerId) conditions.push(eq(salesChallans.customerId, customerId));
    const where = conditions.length ? and(...conditions) : undefined;

    const [data, [{ count }]] = await Promise.all([
      db.select().from(salesChallans).where(where).orderBy(desc(salesChallans.createdAt)).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)::int` }).from(salesChallans).where(where),
    ]);

    return { data, meta: { page, limit, total: count, totalPages: Math.ceil(count / limit) } };
  }

  async findOne(id: string) {
    const [challan] = await db
      .select({ ...getTableColumns(salesChallans), createdByName: users.name, customerName: customers.name })
      .from(salesChallans)
      .leftJoin(users, eq(salesChallans.createdBy, users.id))
      .leftJoin(customers, eq(salesChallans.customerId, customers.id))
      .where(eq(salesChallans.id, id))
      .limit(1);
    if (!challan) throw new NotFoundException('Challan not found');

    const items = await db.select().from(challanItems).where(eq(challanItems.challanId, id));
    return { ...challan, items };
  }

  // Confirm: locks each product row, deducts stock, never goes negative, logs movements.
  // Cancel: if it was confirmed, reverses the deduction (restocks).
  async updateStatus(id: string, newStatus: ChallanStatusInput, userId: string) {
    return db.transaction(async (tx) => {
      const [challan] = await tx
        .select()
        .from(salesChallans)
        .where(eq(salesChallans.id, id))
        .for('update')
        .limit(1);

      if (!challan) throw new NotFoundException('Challan not found');
      if (challan.status === 'cancelled') {
        throw new ConflictException('This challan has already been cancelled');
      }
      if (challan.status === 'confirmed' && newStatus === ChallanStatusInput.CONFIRMED) {
        throw new ConflictException('This challan is already confirmed');
      }

      const items = await tx.select().from(challanItems).where(eq(challanItems.challanId, id));

      if (newStatus === ChallanStatusInput.CONFIRMED) {
        for (const item of items) {
          if (!item.productId) continue;

          const [product] = await tx
            .select()
            .from(products)
            .where(eq(products.id, item.productId))
            .for('update')
            .limit(1);

          if (!product) throw new NotFoundException(`Product ${item.skuSnapshot} no longer exists`);

          const newStock = product.currentStock - item.quantity;
          if (newStock < 0) {
            throw new BadRequestException(
              `Insufficient stock for ${product.name}. Available: ${product.currentStock}, required: ${item.quantity}`,
            );
          }

          await tx
            .update(products)
            .set({ currentStock: newStock, updatedBy: userId, updatedAt: new Date() })
            .where(eq(products.id, item.productId));

          await tx.insert(stockMovements).values({
            productId: item.productId,
            quantityChanged: item.quantity,
            movementType: 'out',
            reason: `Sales challan ${challan.challanNumber}`,
            createdBy: userId,
          });
        }
      }

      if (newStatus === ChallanStatusInput.CANCELLED && challan.status === 'confirmed') {
        for (const item of items) {
          if (!item.productId) continue;

          const [product] = await tx
            .select()
            .from(products)
            .where(eq(products.id, item.productId))
            .for('update')
            .limit(1);
          if (!product) continue;

          await tx
            .update(products)
            .set({ currentStock: product.currentStock + item.quantity, updatedBy: userId, updatedAt: new Date() })
            .where(eq(products.id, item.productId));

          await tx.insert(stockMovements).values({
            productId: item.productId,
            quantityChanged: item.quantity,
            movementType: 'in',
            reason: `Cancelled challan ${challan.challanNumber} — stock reversed`,
            createdBy: userId,
          });
        }
      }

      const [updated] = await tx
        .update(salesChallans)
        .set({ status: newStatus, updatedAt: new Date() })
        .where(eq(salesChallans.id, id))
        .returning();

      return { ...updated, items };
    });
  }
}