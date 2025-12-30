import { IsString, IsOptional } from 'class-validator';

export class RespondPurchaseRequestDto {
  @IsString()
  @IsOptional()
  sellerResponse?: string;
}
