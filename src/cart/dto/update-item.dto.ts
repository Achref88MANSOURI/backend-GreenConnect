import { IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateItemDto {
  @Type(() => Number)
  @IsInt()
  id: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity: number;
}
