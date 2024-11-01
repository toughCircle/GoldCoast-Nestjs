import { OrderItem } from '../models/order-item.model';

export class OrderItemDto {
  id: number;

  itemType: string;

  price: number;

  quantity: number;

  static fromEntity(orderItem: OrderItem): OrderItemDto {
    const dto = new OrderItemDto();
    dto.id = orderItem.id;
    dto.itemType = orderItem.item.itemType;
    dto.quantity = orderItem.quantity;
    dto.price = orderItem.price;
    return dto;
  }
}
