import { Injectable } from '@nestjs/common';
import { Item } from '../models/item.model';
import { OrderItem } from '../models/order-item.model';
import { Order } from '../models/order.model';

@Injectable()
export class PriceFactory {
  calculateTotalPrice(item: Item, quantity: number): number {
    const pricePerGram = item.price;

    const totalPrice = Math.round(pricePerGram * quantity);

    return totalPrice;
  }
}
