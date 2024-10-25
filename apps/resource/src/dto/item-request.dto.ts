import { IsNumber, IsString } from 'class-validator';
import { ItemType } from '../enums/item-type.enum';

export class ItemRequest {
  @IsString()
  itemName: string;

  @IsString()
  itemType: ItemType;

  @IsNumber()
  quantity: number;
}
