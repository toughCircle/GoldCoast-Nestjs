import { Item } from '../models/item.model';

export class ItemDto {
  id: number;

  itemType: string;

  price: number;

  quantity: number;

  static fromEntity(item: Item) {
    const itemDto = new ItemDto();
    (itemDto.id = item.id),
      (itemDto.itemType = item.itemType),
      (itemDto.price = item.price),
      (itemDto.quantity = item.quantity);

    return itemDto;
  }
}
