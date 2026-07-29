import { IsString, IsOptional, IsDateString, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateFollowupDto {
  @IsString() @MinLength(2)
    note!: string;

  @IsOptional() @Transform(({ value }) => (value === '' ? undefined : value)) @IsDateString()
  followUpDate?: string;
}