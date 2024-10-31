import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.model';
import { OrderItem } from './order-item.model';
import { OrderStatus } from '../enums/order-status.enum';
import { Address } from './address.model';
import { BaseEntity } from '@app/common/base.entity';

@Entity()
export class Order extends BaseEntity {
  addOrderItem(orderItem: OrderItem) {
    this.orderItems.push(orderItem);
  }

  @ManyToOne('User', (user: User) => user.orders)
  user: User;

  @Column({ type: 'timestamp' })
  orderDate: Date;

  @Column()
  orderNumber: string;

  @Column()
  totalPrice: number;

  @Column()
  status: OrderStatus;

  @ManyToOne('Address')
  shippingAddress: Address;

  @OneToMany('OrderItem', (orderItem: OrderItem) => orderItem.order)
  orderItems: OrderItem[];

  static create(
    user: User,
    status: OrderStatus,
    orderItems: OrderItem[],
    orderNumber: string,
    shippingAddress: Address,
  ): Order {
    const order = new Order();
    (order.user = user),
      (order.orderDate = new Date()),
      (order.status = status),
      (order.orderItems = orderItems);
    order.orderNumber = orderNumber;
    order.shippingAddress = shippingAddress;
    return order;
  }
}
