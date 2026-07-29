import { Injectable, NotFoundException } from '@nestjs/common';
import { and, eq, or, ilike, desc, sql } from 'drizzle-orm';
import { db } from '../../database/db';
import { customers, customerFollowups } from '../../database/schema';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { QueryCustomerDto } from './dto/query-customer.dto';
import { CreateFollowupDto } from './dto/create-followup.dto';

@Injectable()
export class CustomersService {
  async create(dto: CreateCustomerDto, userId: string) {
    const [customer] = await db
      .insert(customers)
      .values({ ...dto, createdBy: userId, updatedBy: userId })
      .returning();
    return customer;
  }

  async findAll(query: QueryCustomerDto) {
    const { search, status, customerType, page, limit } = query;
    const offset = (page - 1) * limit;

    const conditions = [sql`${customers.deletedAt} IS NULL`];
    if (search) {
      conditions.push(
        or(
          ilike(customers.name, `%${search}%`),
          ilike(customers.mobile, `%${search}%`),
          ilike(customers.businessName, `%${search}%`),
        )!,
      );
    }
    if (status) conditions.push(eq(customers.status, status as any));
    if (customerType) conditions.push(eq(customers.customerType, customerType as any));

    const where = and(...conditions);

    const [data, [{ count }]] = await Promise.all([
      db.select().from(customers).where(where).orderBy(desc(customers.createdAt)).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)::int` }).from(customers).where(where),
    ]);

    return {
      data,
      meta: { page, limit, total: count, totalPages: Math.ceil(count / limit) },
    };
  }

  async findOne(id: string) {
    const [customer] = await db.select().from(customers).where(eq(customers.id, id)).limit(1);
    if (!customer) throw new NotFoundException('Customer not found');

    const followups = await db
      .select()
      .from(customerFollowups)
      .where(eq(customerFollowups.customerId, id))
      .orderBy(desc(customerFollowups.createdAt));

    return { ...customer, followups };
  }

  async update(id: string, dto: UpdateCustomerDto, userId: string) {
    const [customer] = await db
      .update(customers)
      .set({ ...dto, updatedBy: userId, updatedAt: new Date() })
      .where(eq(customers.id, id))
      .returning();
    if (!customer) throw new NotFoundException('Customer not found');
    return customer;
  }

  async addFollowup(customerId: string, dto: CreateFollowupDto, userId: string) {
    const [customer] = await db.select().from(customers).where(eq(customers.id, customerId)).limit(1);
    if (!customer) throw new NotFoundException('Customer not found');

    const [followup] = await db
      .insert(customerFollowups)
      .values({ customerId, note: dto.note, followUpDate: dto.followUpDate, createdBy: userId })
      .returning();

    // keep the customer's next follow-up date in sync if one was given
    if (dto.followUpDate) {
      await db.update(customers).set({ followUpDate: dto.followUpDate }).where(eq(customers.id, customerId));
    }

    return followup;
  }
}