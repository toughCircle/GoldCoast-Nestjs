import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Headers,
  ParseIntPipe,
  HttpStatus,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthService } from '../services/auth.service.js';
import { ItemService } from '../services/item.service';
import { ItemRequest } from '../dto/item-request.dto.js';
import { BaseApiResponse } from '@app/common';
import { ItemDto } from '../dto/item.dto.js';
import { JwtAuthGuard } from '../guards/jwt-auth.guard.js';
import { Request } from 'express';

@Controller('resource/items')
@UseGuards(JwtAuthGuard)
export class ItemController {
  constructor(private readonly itemService: ItemService) {}

  // 아이템 생성 (판매자만 가능)
  @Post()
  async createItem(
    @Req() request: Request,
    @Headers('Authorization') token: string,
    @Body() createItemDto: ItemRequest,
  ): Promise<BaseApiResponse<void>> {
    const userResponse = request['user'];

    await this.itemService.createItem(createItemDto, userResponse);
    return BaseApiResponse.of(HttpStatus.CREATED, 'Item created successfully');
  }

  // 아이템 조회 (모든 사용자 가능)
  @Get(':id')
  async getItemById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<BaseApiResponse<ItemDto>> {
    const item = await this.itemService.getItemById(id);
    return BaseApiResponse.of(
      HttpStatus.OK,
      'Item retrieved successfully',
      item,
    );
  }

  // 전체 아이템 목록 조회 (모든 사용자 가능)
  @Get()
  async getAllItems(): Promise<BaseApiResponse<ItemDto[]>> {
    const items = await this.itemService.getAllItems();
    return BaseApiResponse.of(
      HttpStatus.OK,
      'All items retrieved successfully',
      items,
    );
  }

  // 아이템 수정 (판매자만 가능)
  @Patch(':id')
  async updateItem(
    @Req() request: Request,
    @Param('id') id: number,
    @Body() updateItemDto: ItemRequest,
    @Headers('Authorization') token: string,
  ): Promise<BaseApiResponse<void>> {
    const userResponse = request['user'];
    await this.itemService.updateItem(id, updateItemDto, userResponse);
    return BaseApiResponse.of(HttpStatus.OK, 'Item updated successfully');
  }

  // 아이템 삭제 (판매자만 가능)
  @Delete(':id')
  async deleteItem(
    @Req() request: Request,
    @Param('id') id: number,
    @Headers('Authorization') token: string,
  ): Promise<BaseApiResponse<void>> {
    const userResponse = request['user'];
    await this.itemService.deleteItem(id, userResponse);
    return BaseApiResponse.of(HttpStatus.OK, 'Item deleted successfully');
  }
}
