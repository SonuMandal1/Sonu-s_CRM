import { IsUUID, IsArray, ValidateNested, IsInt, Min, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';

export class ChallanItemDto {
  @IsUUID()
    productId!: string;

  @IsInt()
    @Min(1)
    quantity!: number;
}

export class CreateChallanDto {
  @IsUUID()
    customerId!: string;

  @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    @Type(() => ChallanItemDto)
    items!: ChallanItemDto[];
}