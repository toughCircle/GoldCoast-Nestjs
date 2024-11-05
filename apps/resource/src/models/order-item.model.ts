import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Order } from './order.model';
import { Item } from './item.model';
import { BaseEntity } from '@app/common/base.entity';

@Entity()
export class OrderItem extends BaseEntity {
  @ManyToOne('Order', (order: Order) => order.orderItems)
  order: Order;

  @ManyToOne(() => Item)
  item: Item;

  @Column('decimal', { precision: 10, scale: 1 })
  quantity: number;

  @Column()
  price: number;
}
