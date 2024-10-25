import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Order } from './order.model';
import { Item } from './item.model';

@Entity()
export class OrderItem {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne('Order', (order: Order) => order.orderItems)
  order: Order;

  @ManyToOne(() => Item)
  item: Item;

  @Column()
  quantity: number;

  @Column()
  price: number;
}
