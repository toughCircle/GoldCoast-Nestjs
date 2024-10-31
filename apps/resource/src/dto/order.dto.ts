import { OrderItem } from '../models/order-item.model';
import { OrderStatus } from '../enums/order-status.enum';
import { Address } from '../models/address.model';
import { Order } from '../models/order.model';
import { AddressDto } from './address.dto';
import { OrderItemDto } from './order-item.dto';

export class OrderDto {
  id: number;

  userId: number;

  orderDate: Date;

  orderNumber: string;

  totalPrice: number;

  status: OrderStatus;

  shippingAddress: AddressDto;

  orderItems: OrderItemDto[];

  static fromEntity(order: Order): OrderDto {
    const orderDto = new OrderDto();
    orderDto.id = order.id;
    orderDto.userId = order.user.id;
    orderDto.orderDate = order.orderDate;
    orderDto.orderNumber = order.orderNumber;
    orderDto.totalPrice = order.totalPrice;
    orderDto.status = order.status;
    orderDto.shippingAddress = AddressDto.fromEntity(order.shippingAddress);
    orderDto.orderItems = order.orderItems.map(OrderItemDto.fromEntity);
    return orderDto;
  }
}
