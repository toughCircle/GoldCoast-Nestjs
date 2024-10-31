import { HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../models/order.model';
import { Address } from '../models/address.model';
import { Item } from '../models/item.model';
import { OrderValidator } from '../validators/order-validator.service';
import { PriceFactory } from './price-factory.service';
import { OrderRequest } from '../dto/order-request.dto';
import { ValidateTokenResponse } from '../auth.interface';
import { OrderStatus } from '../enums/order-status.enum';
import { User } from '../models/user.model';
import { OrderItem } from '../models/order-item.model';
import { StatusCode } from '../enums/status-code.enum';
import { OrderDto } from '../dto/order.dto';
import { BaseApiResponse } from '@app/common';

@Injectable()
export class OrderService {
  private readonly ORDER_PREFIX = 'ORD-';

  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
    @InjectRepository(Address)
    private addressRepository: Repository<Address>,
    @InjectRepository(Item)
    private itemRepository: Repository<Item>,
    private readonly orderValidator: OrderValidator,
    private readonly priceFactory: PriceFactory,
  ) {}

  async createOrder(
    orderRequest: OrderRequest,
    userResponse: ValidateTokenResponse,
  ): Promise<BaseApiResponse<OrderDto>> {
    this.orderValidator.validateUserRole(userResponse.role, 'USER');

    let user = await this.userRepository.findOne({
      where: { email: userResponse.email },
    });

    if (!user) {
      user = User.create(userResponse.username, userResponse.email);
      await this.userRepository.save(user); // 새로운 사용자 저장
    }

    const orderNumber = this.generateUniqueOrderNumber();
    const status = OrderStatus.ORDER_PLACED;

    const orderItems: OrderItem[] = await Promise.all(
      orderRequest.items.map(async (orderItemRequest) => {
        const item = await this.itemRepository.findOne({
          where: { id: orderItemRequest.id },
        });

        if (!item) {
          throw new Error('Item not found');
        }

        this.orderValidator.validateItemQuantity(
          orderItemRequest.quantity,
          item.quantity,
        );

        const orderItem = new OrderItem();
        orderItem.item = item;
        orderItem.quantity = orderItemRequest.quantity;
        orderItem.price = this.priceFactory.calculateTotalPrice(
          item,
          orderItemRequest.quantity,
        );
        await this.orderItemRepository.save(orderItem);

        item.quantity -= orderItemRequest.quantity;
        await this.itemRepository.save(item);

        return orderItem;
      }),
    );

    const address = Address.create(
      orderRequest.shippingAddress.streetAddress,
      orderRequest.shippingAddress.zipCode,
      orderRequest.shippingAddress.addressDetail,
      user,
    );
    await this.addressRepository.save(address);

    const order = Order.create(user, status, orderItems, orderNumber, address);

    const totalPrice = this.calculateTotalPrice(orderItems);
    order.totalPrice = totalPrice;

    await this.orderRepository.save(order);

    return BaseApiResponse.of(
      HttpStatus.CREATED,
      'Order success',
      OrderDto.fromEntity(order),
    );
  }

  // 주문 총 금액 계산
  private calculateTotalPrice(orderItems: OrderItem[]): number {
    return orderItems.reduce((sum, orderItem) => {
      return sum + orderItem.price;
    }, 0);
  }

  // 주문 조회 (사용자에 따른 필터링 포함)
  async getOrdersByUser(userResponse: ValidateTokenResponse): Promise<Order[]> {
    const email = userResponse.email;
    const user = await this.userRepository.findOne({
      where: { email },
    });
    return this.orderRepository.find({
      where: { user: { id: user.id } },
      relations: ['orderItems', 'shippingAddress'],
    });
  }

  // 주문 상태 업데이트
  async updateOrderStatus(
    orderId: number,
    newStatus: OrderStatus,
    userRole: string,
  ): Promise<OrderDto> {
    console.log('orderId: ', orderId);
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['user', 'shippingAddress', 'orderItems'],
    });
    if (!order) throw new Error('Order not found');

    if (order.status === newStatus) throw new Error('Invalid status update');

    this.orderValidator.validateOrderStatusTransition(
      order.status,
      newStatus,
      userRole,
    );
    order.status = newStatus;

    const savedOrder = await this.orderRepository.save(order);

    console.log('savedOrder: ', savedOrder);

    return OrderDto.fromEntity(savedOrder);
  }

  // 주문 취소 (구매자만 가능)
  async cancelOrder(
    orderId: number,
    userResponse: ValidateTokenResponse,
  ): Promise<void> {
    if (userResponse.role !== 'USER') {
      throw new UnauthorizedException(StatusCode.FORBIDDEN);
    }

    const order = await this.findOrderById(orderId);

    // 주문 상태에 따른 취소 가능 여부 확인
    if (order.status === OrderStatus.ORDER_PLACED) {
      order.status = OrderStatus.ORDER_CANCELLED;
    } else if (
      [OrderStatus.PAYMENT_RECEIVED, OrderStatus.SHIPPED].includes(order.status)
    ) {
      throw new Error('REFUND_REQUIRED');
    } else {
      throw new Error('RETURN_OR_REFUND_REQUIRED');
    }

    await this.orderRepository.save(order);
  }

  // 주문 번호 생성
  private generateUniqueOrderNumber(): string {
    const datePart = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const randomPart = Math.floor(1000 + Math.random() * 9000).toString();
    return `${this.ORDER_PREFIX}${datePart}-${randomPart}`;
  }

  // 특정 주문 조회
  private async findOrderById(orderId: number): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
    });
    if (!order) throw new Error('Order not found');
    return order;
  }
}
