import { Injectable } from '@nestjs/common';
import { Item } from '../models/item.model';
import { OrderItem } from '../models/order-item.model';
import { Order } from '../models/order.model';

@Injectable()
export class PriceFactory {
  calculateTotalPrice(item: Item, quantity: number): number {
    const pricePerGram = item.price;

    const totalPrice = Math.round(pricePerGram * quantity * 100) / 100;

    return totalPrice;
  }

  // 주문 항목 생성
  createOrderItem(order: Order, item: Item, quantity: number): OrderItem {
    const orderItem = new OrderItem();
    orderItem.order = order;
    orderItem.item = item;
    orderItem.quantity = quantity;

    const totalPrice = this.calculateTotalPrice(item, quantity);
    orderItem.price = totalPrice;

    return orderItem;
  }
}
