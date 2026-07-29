import { IsString, IsOptional, IsUUID, IsNumber, Min, MinLength } from 'class-validator';

export class CreateProductDto {
  @IsString() @MinLength(2)
  name: string;

  @IsString() @MinLength(2)
  sku: string;

  @IsOptional() @IsUUID()
  categoryId?: string;

  @IsNumber() @Min(0)
  unitPrice: number;

  @IsOptional() @IsNumber() @Min(0)
  currentStock?: number;

  @IsOptional() @IsNumber() @Min(0)
  minStockAlert?: number;

  @IsOptional() @IsUUID()
  warehouseId?: string;
}