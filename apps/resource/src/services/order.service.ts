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

@Injectable()
export class OrderService {
  private readonly ORDER_PREFIX = 'ORD-';

  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(Address)
    private addressRepository: Repository<Address>,
    @InjectRepository(Item)
    private itemRepository: Repository<Item>,
    private readonly orderValidator: OrderValidator,
    private readonly priceFactory: PriceFactory,
  ) {}

  // 주문 생성
  async createOrder(
    orderRequest: OrderRequest,
    userResponse: ValidateTokenResponse,
  ): Promise<void> {
    this.orderValidator.validateUserRole(userResponse.role, 'BUYER');

    const user = User.create(userResponse.username, userResponse.email);

    const orderNumber = this.generateUniqueOrderNumber();

    // 주문 상태를 초기값으로 설정
    const status = OrderStatus.ORDER_PLACED;

    // OrderItems 생성
    const orderItems: OrderItem[] = await Promise.all(
      orderRequest.items.map(async (orderItemRequest) => {
        const item = await this.itemRepository.findOne({
          where: { id: orderItemRequest.id },
        });

        if (!item) {
          throw new Error('Item not found');
        }

        // OrderItem 생성 및 설정
        const orderItem = new OrderItem();
        orderItem.item = item;
        orderItem.quantity = orderItemRequest.quantity;
        orderItem.price = item.price;
        return orderItem;
      }),
    );

    // 새로운 주소 생성
    const address = Address.create(
      orderRequest.shippingAddress.streetAddress,
      orderRequest.shippingAddress.zipCode,
      orderRequest.shippingAddress.addressDetail,
      user,
    );
    await this.addressRepository.save(address);

    // 새로운 주문 생성
    const order = Order.create(user, status, orderItems, orderNumber, address);

    for (const orderItemRequest of orderRequest.items) {
      const item = await this.itemRepository.findOne({
        where: { id: orderItemRequest.id },
      });
      if (!item) throw new Error('Item not found');

      this.orderValidator.validateItemQuantity(
        orderItemRequest.quantity,
        item.quantity,
      );

      const orderItem = this.priceFactory.createOrderItem(
        order,
        item,
        orderItemRequest.quantity,
      );
      order.addOrderItem(orderItem);

      // 각 상품의 판매 가능 수량 조정
      item.quantity -= orderItemRequest.quantity;
      await this.itemRepository.save(item);
    }

    // 주문의 총 금액 계산
    const totalPrice = this.calculateTotalPrice(order.orderItems);
    order.totalPrice = totalPrice;

    await this.orderRepository.save(order);
  }

  // 주문 총 금액 계산
  private calculateTotalPrice(orderItems: OrderItem[]): number {
    return orderItems.reduce((sum, orderItem) => {
      return (
        sum +
        this.priceFactory.calculateTotalPrice(
          orderItem.item,
          orderItem.quantity,
        )
      );
    }, 0);
  }

  // 주문 조회 (사용자에 따른 필터링 포함)
  async getOrdersByUser(userId: number): Promise<Order[]> {
    return this.orderRepository.find({
      where: { user: { id: userId } },
      relations: ['orderItems', 'shippingAddress'],
    });
  }

  // 주문 상태 업데이트
  async updateOrderStatus(
    orderId: number,
    newStatus: OrderStatus,
    userRole: string,
  ): Promise<OrderDto> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
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

    return OrderDto.fromEntity(savedOrder);
  }

  // 주문 취소 (구매자만 가능)
  async cancelOrder(
    orderId: number,
    userResponse: ValidateTokenResponse,
  ): Promise<void> {
    if (userResponse.role !== 'BUYER') {
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
