import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { ItemType } from '../enums/item-type.enum';
import { BaseEntity } from '@app/common/base.entity';

@Entity()
export class GoldPrice extends BaseEntity {
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
