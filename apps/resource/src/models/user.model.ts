import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Address } from './address.model';
import { Order } from './order.model';
import { BaseEntity } from '@app/common/base.entity';

@Entity('users')
@Unique(['email'])
export class User extends BaseEntity {
  @Column()
  username: string;

  @Column()
  email: string;

  @OneToMany('Address', (address: Address) => address.user)
  addresses: Address[];

  @OneToMany('Order', (order: Order) => order.user)
  orders: Order[];

  static create(username: string, email: string): User {
    const user = new User();
    user.username = username;
    user.email = email;
    user.addresses = [];
    user.orders = [];
    return user;
  }
}
