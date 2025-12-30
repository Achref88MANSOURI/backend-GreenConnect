import { IsInt, IsString, IsOptional, Min, IsNotEmpty } from 'class-validator';

export class CreatePurchaseRequestDto {
  @IsInt()
  productId: number;

  @IsInt()
  @Min(1)
  quantity: number;

  @IsString()
  @IsNotEmpty()
  buyerName: string;

  @IsString()
  @IsNotEmpty()
  buyerPhone: string;

  @IsString()
  @IsOptional()
  buyerAddress?: string;

  @IsString()
  @IsOptional()
  buyerMessage?: string;
}
