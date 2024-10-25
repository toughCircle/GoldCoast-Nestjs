import { OrderItem } from '../models/order-item.model';
import { OrderStatus } from '../enums/order-status.enum';
import { Address } from '../models/address.model';
import { Order } from '../models/order.model';

export class OrderDto {
  id: number;

  userId: number;

  orderDate: Date;

  orderNumber: string;

  totalPrice: number;

  status: OrderStatus;

  shippingAddress: Address;

  orderItems: OrderItem[];

  static fromEntity(order: Order): OrderDto {
    const orderDto = new OrderDto();
    orderDto.id = order.id;
    orderDto.userId = order.user.id;
    orderDto.orderDate = order.orderDate;
    orderDto.orderNumber = order.orderNumber;
    orderDto.totalPrice = order.totalPrice;
    orderDto.status = order.status;
    orderDto.shippingAddress = order.shippingAddress;
    orderDto.orderItems = order.orderItems;
    return orderDto;
  }
}
