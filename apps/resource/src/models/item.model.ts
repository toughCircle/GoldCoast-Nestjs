import { BaseEntity } from '@app/common/base.entity';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Item extends BaseEntity {
  @Column()
  itemType: string;

  @Column()
  price: number;

  @Column()
  quantity: number;

  @Column()
  sellerId: number;

  updateItem(itemType: string, quantity: number) {
    (this.itemType = itemType), (this.quantity = quantity);
  }

  static createItem(
    itemType: string,
    price: number,
    quantity: number,
    sellerId: number,
  ) {
    const item = new Item();
    (item.itemType = itemType),
      (item.price = price),
      (item.quantity = quantity),
      (item.sellerId = sellerId);
    return item;
  }
}
