import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Item } from '../models/item.model';
import { OrderStatus } from '../enums/order-status.enum';
import { BusinessException } from '../exceptions/business-exception';
import { StatusCode } from '../enums/status-code.enum';

@Injectable()
export class OrderValidator {
  constructor(
    @InjectRepository(Item) private itemRepository: Repository<Item>,
  ) {}

  // 주문 상태 전환 검증
  validateOrderStatusTransition(
    currentStatus: OrderStatus,
    newStatus: OrderStatus,
    role: string,
  ): void {
    if (role === 'BUYER') {
      if (!this.isValidBuyerStatusUpdate(currentStatus, newStatus)) {
        throw new BusinessException('', StatusCode.FORBIDDEN);
      }
    } else if (role === 'SELLER') {
      if (!this.isValidSellerStatusUpdate(currentStatus, newStatus)) {
        throw new BusinessException('', StatusCode.FORBIDDEN);
      }
    }
  }

  // 구매자의 상태 전환 유효성 확인
  private isValidBuyerStatusUpdate(
    currentStatus: OrderStatus,
    newStatus: OrderStatus,
  ): boolean {
    return (
      (currentStatus === OrderStatus.ORDER_PLACED &&
        newStatus === OrderStatus.PAYMENT_RECEIVED) ||
      (currentStatus === OrderStatus.PAYMENT_RECEIVED &&
        newStatus === OrderStatus.SHIPPED)
    );
  }

  // 판매자의 상태 전환 유효성 확인
  private isValidSellerStatusUpdate(
    currentStatus: OrderStatus,
    newStatus: OrderStatus,
  ): boolean {
    return (
      currentStatus === OrderStatus.ORDER_PLACED ||
      newStatus === OrderStatus.RECEIVED
    );
  }

  // 구매자/판매자 권한 검증
  validateUserRole(userRole: string, expectedRole: string): void {
    if (userRole !== expectedRole) {
      throw new BusinessException('', StatusCode.FORBIDDEN);
    }
  }

  // 구매 가능 수량 검증
  validateItemQuantity(
    requestedQuantity: number,
    availableQuantity: number,
  ): void {
    if (requestedQuantity > availableQuantity) {
      throw new BusinessException(
        'Requested quantity exceeds available quantity',
        StatusCode.ORDER_QUANTITY_EXCEEDED,
      );
    }
  }
}
