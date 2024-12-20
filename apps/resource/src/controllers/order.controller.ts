import {
  Controller,
  Post,
  Body,
  Param,
  Get,
  UseGuards,
  Req,
  Patch,
  Query,
  HttpStatus,
} from '@nestjs/common';
import { OrderRequest } from '../dto/order-request.dto';
import { OrderService } from '../services/order.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { Request } from 'express';
import { OrderStatus } from '../enums/order-status.enum';
import { BaseApiResponse } from '@app/common';
import { OrderDto } from '../dto/order.dto';

@Controller('resource/orders')
@UseGuards(JwtAuthGuard)
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  create(@Req() request: Request, @Body() orderRequest: OrderRequest) {
    const user = request['user'];
    return this.orderService.createOrder(orderRequest, user);
  }

  // 사용자의 모든 주문 조회
  @Get()
  findOne(
    @Req() request: Request,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    const user = request['user'];
    return this.orderService.getOrdersByUser(user, page, limit);
  }

  // 주문 상태 수정
  @Patch(':orderId/status')
  async updateOrderStatus(
    @Param('orderId') orderId: number,
    @Query('newStatus') newStatus: OrderStatus,
    @Req() request: Request,
  ): Promise<BaseApiResponse<OrderDto> | BaseApiResponse<void>> {
    const userResponse = request['user'];
    if (newStatus === OrderStatus.ORDER_CANCELLED) {
      await this.orderService.cancelOrder(orderId, userResponse);
      return BaseApiResponse.of(
        HttpStatus.OK,
        'Order cancelled successfully',
        null,
      );
    } else {
      // 상태 업데이트 로직 호출
      const updatedOrder = await this.orderService.updateOrderStatus(
        orderId,
        newStatus,
        userResponse.role,
      );
      return BaseApiResponse.of(HttpStatus.OK, 'Order success', updatedOrder);
    }
  }

  @Get(':itemId')
  async findByItemId(
    @Req() request: Request,
    @Param('itemId') itemId: number,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    const user = request['user'];
    const data = await this.orderService.getOrdersByItemId(
      user,
      itemId,
      page,
      limit,
    );
    return BaseApiResponse.of(
      HttpStatus.OK,
      'order retrieved successfully',
      data,
    );
  }
}
