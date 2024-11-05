import { Injectable } from '@nestjs/common';
import { Item } from '../models/item.model';

@Injectable()
export class PriceFactory {
  calculateTotalPrice(item: Item, quantity: number): number {
    const pricePerGram = item.price;

    const totalPrice = Math.round(pricePerGram * quantity);

    return totalPrice;
  }
}
