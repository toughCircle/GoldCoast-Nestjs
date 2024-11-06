import { HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository, Transaction } from 'typeorm';
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
import { Transactional } from 'typeorm-transactional';

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

  @Transactional()
  async createOrder(
    orderRequest: OrderRequest,
    userResponse: ValidateTokenResponse,
  ): Promise<BaseApiResponse<OrderDto>> {
    this.orderValidator.validateUserRole(userResponse.role, 'USER');

    // 사용자 조회 및 생성
    let user = await this.userRepository.findOne({
      where: { email: userResponse.email },
    });

    if (!user) {
      user = User.create(userResponse.username, userResponse.email);
      await this.userRepository.save(user);
    }

    const orderNumber = this.generateUniqueOrderNumber();
    const status = OrderStatus.ORDER_PLACED;

    const itemIds = orderRequest.items.map((item) => item.id); // 아이템 ID 리스트 생성

    // 모든 아이템을 한 번에 조회
    const items = await this.itemRepository.find({
      where: { id: In(itemIds) },
      lock: { mode: 'pessimistic_write' }, // 동시성 문제 방지
    });

    // 조회한 아이템들을 Map으로 변환하여 빠르게 접근할 수 있도록 설정
    const itemMap = new Map(items.map((item) => [item.id, item]));

    const orderItems: OrderItem[] = [];
    for (const orderItemRequest of orderRequest.items) {
      const item = itemMap.get(orderItemRequest.id); // Map에서 아이템 조회

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

      orderItems.push(orderItem);
      item.quantity -= orderItemRequest.quantity;
    }

    // 모든 OrderItems 한 번에 저장
    await this.orderItemRepository.save(orderItems);

    // 수량이 업데이트된 아이템들도 한 번에 저장
    await this.itemRepository.save(items);

    // 주소 생성 및 저장
    let address = await this.addressRepository.findOne({
      where: {
        streetAddress: orderRequest.shippingAddress.streetAddress,
        zipCode: orderRequest.shippingAddress.zipCode,
        addressDetail: orderRequest.shippingAddress.addressDetail,
        user: user,
      },
    });

    if (!address) {
      // 주소가 없으면 새로 생성
      address = Address.create(
        orderRequest.shippingAddress.streetAddress,
        orderRequest.shippingAddress.zipCode,
        orderRequest.shippingAddress.addressDetail,
        user,
      );
      await this.addressRepository.save(address);
    }

    // 주문 생성 및 저장
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
  async getOrdersByUser(
    userResponse: ValidateTokenResponse,
    page: number,
    limit: number,
  ): Promise<{ data: OrderDto[]; total: number; currentPage: number }> {
    const offset = (page - 1) * limit;
    const email = userResponse.email;
    const user = await this.userRepository.findOne({
      where: { email },
    });

    const [orders, total] = await this.orderRepository.findAndCount({
      where: { user: { id: user.id } },
      relations: ['orderItems', 'orderItems.item', 'shippingAddress', 'user'],
      skip: offset,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    const data = orders.map((order) => OrderDto.fromEntity(order));

    return {
      data,
      total,
      currentPage: page,
    };
  }

  // 특정 상품의 주문 내역 조회
  async getOrdersByItemId(
    userResponse: ValidateTokenResponse,
    itemId: number,
    page: number,
    limit: number,
  ): Promise<{ data: OrderDto[]; total: number; currentPage: number }> {
    const offset = (page - 1) * limit;
    const [orders, total] = await this.orderRepository.findAndCount({
      where: { orderItems: { item: { id: itemId } } },
      relations: ['orderItems', 'orderItems.item', 'user', 'shippingAddress'],
      skip: offset,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    const data = orders.map((order) => OrderDto.fromEntity(order));
    return { data, total, currentPage: page };
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
