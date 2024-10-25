import { Address } from '../models/address.model';
import { Order } from '../models/order.model';
import { User } from '../models/user.model';
import { OrderDto } from './order.dto';

export class UserDto {
  id: number;

  username: string;

  email: string;

  addresses: Address[];

  orders: OrderDto[];

  static fromEntity(user: User): UserDto {
    const userDto = new UserDto();

    userDto.id = user.id;
    userDto.username = user.username;
    userDto.email = user.email;
    userDto.addresses = user.addresses;
    userDto.orders = user.orders.map((order) => OrderDto.fromEntity(order));
    return userDto;
  }
}
