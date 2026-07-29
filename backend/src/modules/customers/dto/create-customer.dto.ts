import { IsEmail, IsEnum, IsOptional, IsString, IsDateString, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';

export enum CustomerType { RETAIL = 'retail', WHOLESALE = 'wholesale', DISTRIBUTOR = 'distributor' }
export enum CustomerStatus { LEAD = 'lead', ACTIVE = 'active', INACTIVE = 'inactive' }

// An empty string from an untouched optional form field should mean "not provided",
// not "provided but invalid" — @IsOptional() alone only skips null/undefined.
const emptyToUndefined = ({ value }: { value: unknown }) => (value === '' ? undefined : value);

export class CreateCustomerDto {
  @IsString() @MinLength(2)
  name: string;

  @IsString() @MinLength(7)
  mobile: string;

  @IsOptional() @Transform(emptyToUndefined) @IsEmail()
  email?: string;

  @IsOptional() @IsString()
  businessName?: string;

  @IsOptional() @IsString()
  gstNumber?: string;

  @IsEnum(CustomerType)
  customerType: CustomerType;

  @IsOptional() @IsString()
  address?: string;

  @IsEnum(CustomerStatus)
  status: CustomerStatus;

  @IsOptional() @Transform(emptyToUndefined) @IsDateString()
  followUpDate?: string;

  @IsOptional() @IsString()
  notes?: string;
}