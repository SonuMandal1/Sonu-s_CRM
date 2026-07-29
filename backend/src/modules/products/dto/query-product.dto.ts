import { IsOptional, IsString, IsInt, Min, IsUUID, IsBoolean } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class QueryProductDto {
  @IsOptional() @IsString()
  search?: string;

  @IsOptional() @IsUUID()
  categoryId?: string;

  @IsOptional() @IsUUID()
  warehouseId?: string;

  // Query strings are always text, so "false" must not become the boolean true
  // (which is what plain `Boolean("false")` — and class-transformer's @Type(() => Boolean) — would do).
  @IsOptional() @Transform(({ value }) => value === true || value === 'true') @IsBoolean()
  lowStockOnly?: boolean;

  @IsOptional() @Type(() => Number) @IsInt() @Min(1)
  page: number = 1;

  @IsOptional() @Type(() => Number) @IsInt() @Min(1)
  limit: number = 20;
}