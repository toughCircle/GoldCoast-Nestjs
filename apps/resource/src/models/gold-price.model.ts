import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { ItemType } from '../enums/item-type.enum';

@Entity()
export class GoldPrice {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  goldType: ItemType;

  @Column()
  price: number;

  updatePrice(price: number): void {
    this.price = price;
  }

  static createGoldPrice(goldType: ItemType, price: number): GoldPrice {
    const goldPrice = new GoldPrice();
    (goldPrice.goldType = goldType), (goldPrice.price = price);
    return goldPrice;
  }
}
