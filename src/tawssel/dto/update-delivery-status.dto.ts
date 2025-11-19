import { IsString, IsIn } from 'class-validator';

export class UpdateDeliveryStatusDto {
  @IsString()
  @IsIn(['PENDING', 'PENDING_PICKUP', 'IN_TRANSIT', 'DELIVERED', 'CANCELED'])
  status: string;
}
