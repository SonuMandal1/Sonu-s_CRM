import { IsEnum } from 'class-validator';

export enum ChallanStatusInput { CONFIRMED = 'confirmed', CANCELLED = 'cancelled' }

export class UpdateChallanStatusDto {
  @IsEnum(ChallanStatusInput)
    status!: ChallanStatusInput;
}