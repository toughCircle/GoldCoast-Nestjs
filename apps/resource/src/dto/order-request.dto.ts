import { IsArray, IsNotEmpty, ValidateNested } from 'class-validator';
import { AddressRequest } from './address-request.dto';
import { Type } from 'class-transformer';
import { OrderItemRequest } from './order-item-request.dto';

export class OrderRequest {
  @ValidateNested({ each: true })
  @Type(() => OrderItemRequest)
  @IsArray()
  @IsNotEmpty({ message: 'Order items cannot be empty' })
  items: OrderItemRequest[];

  @ValidateNested()
  @Type(() => AddressRequest)
  @IsNotEmpty({ message: 'Shipping address is required' })
  shippingAddress: AddressRequest;
}
