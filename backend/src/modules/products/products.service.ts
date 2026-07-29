import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { and, eq, ilike, or, desc, sql, getTableColumns } from 'drizzle-orm';
import { db } from '../../database/db';
import { products, stockMovements, categories, warehouses, users } from '../../database/schema';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductDto } from './dto/query-product.dto';
import { AdjustStockDto, MovementType } from './dto/adjust-stock.dto';

@Injectable()
export class ProductsService {
  async create(dto: CreateProductDto, userId: string) {
    const [product] = await db
      .insert(products)
      .values({
        ...dto,
        unitPrice: dto.unitPrice.toString(),
        currentStock: dto.currentStock ?? 0,
        minStockAlert: dto.minStockAlert ?? 0,
        createdBy: userId,
        updatedBy: userId,
      })
      .returning();
    return product;
  }

  async findAll(query: QueryProductDto) {
    const { search, categoryId, warehouseId, lowStockOnly, page, limit } = query;
    const offset = (page - 1) * limit;

    const conditions = [sql`${products.deletedAt} IS NULL`];
    if (search) {
      conditions.push(or(ilike(products.name, `%${search}%`), ilike(products.sku, `%${search}%`))!);
    }
    if (categoryId) conditions.push(eq(products.categoryId, categoryId));
    if (warehouseId) conditions.push(eq(products.warehouseId, warehouseId));
    if (lowStockOnly) conditions.push(sql`${products.currentStock} <= ${products.minStockAlert}`);

    const where = and(...conditions);

    const [data, [{ count }]] = await Promise.all([
      db
        .select({
          ...getTableColumns(products),
          categoryName: categories.name,
          warehouseName: warehouses.name,
        })
        .from(products)
        .leftJoin(categories, eq(products.categoryId, categories.id))
        .leftJoin(warehouses, eq(products.warehouseId, warehouses.id))
        .where(where)
        .orderBy(desc(products.createdAt))
        .limit(limit)
        .offset(offset),
      db.select({ count: sql<number>`count(*)::int` }).from(products).where(where),
    ]);

    return { data, meta: { page, limit, total: count, totalPages: Math.ceil(count / limit) } };
  }

  async findOne(id: string) {
    const [product] = await db.select().from(products).where(eq(products.id, id)).limit(1);
    if (!product) throw new NotFoundException('Product not found');

    const movements = await db
      .select({ ...getTableColumns(stockMovements), createdByName: users.name })
      .from(stockMovements)
      .leftJoin(users, eq(stockMovements.createdBy, users.id))
      .where(eq(stockMovements.productId, id))
      .orderBy(desc(stockMovements.createdAt))
      .limit(50);

    return { ...product, recentMovements: movements };
  }

  async update(id: string, dto: UpdateProductDto, userId: string) {
    const updateData: any = { ...dto, updatedBy: userId, updatedAt: new Date() };
    if (dto.unitPrice !== undefined) updateData.unitPrice = dto.unitPrice.toString();

    const [product] = await db.update(products).set(updateData).where(eq(products.id, id)).returning();
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  // Atomic stock adjustment — row-locked so concurrent requests can't push stock negative
  async adjustStock(productId: string, dto: AdjustStockDto, userId: string) {
    return db.transaction(async (tx) => {
      const [product] = await tx
        .select()
        .from(products)
        .where(eq(products.id, productId))
        .for('update')
        .limit(1);

      if (!product) throw new NotFoundException('Product not found');

      const delta = dto.movementType === MovementType.IN ? dto.quantity : -dto.quantity;
      const newStock = product.currentStock + delta;

      if (newStock < 0) {
        throw new BadRequestException(
          `Insufficient stock for ${product.name}. Available: ${product.currentStock}, requested: ${dto.quantity}`,
        );
      }

      const [updated] = await tx
        .update(products)
        .set({ currentStock: newStock, updatedBy: userId, updatedAt: new Date() })
        .where(eq(products.id, productId))
        .returning();

      await tx.insert(stockMovements).values({
        productId,
        quantityChanged: dto.quantity,
        movementType: dto.movementType,
        reason: dto.reason,
        createdBy: userId,
      });

      return updated;
    });
  }

  // Minimal support endpoints needed by the product form
  async listCategories() {
    return db.select().from(categories).orderBy(categories.name);
  }

  async createCategory(name: string) {
    const [category] = await db.insert(categories).values({ name }).returning();
    return category;
  }

  async listWarehouses() {
    return db.select().from(warehouses).orderBy(warehouses.name);
  }

  async createWarehouse(name: string, location?: string) {
    const [warehouse] = await db.insert(warehouses).values({ name, location }).returning();
    return warehouse;
  }
}