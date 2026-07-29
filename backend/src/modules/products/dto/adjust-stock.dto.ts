import { IsEnum, IsInt, IsString, Min, MinLength } from 'class-validator';

export enum MovementType { IN = 'in', OUT = 'out' }

export class AdjustStockDto {
  @IsInt() @Min(1)
  quantity: number;

  @IsEnum(MovementType)
  movementType: MovementType;

  @IsString() @MinLength(2)
    reason!: string;
}