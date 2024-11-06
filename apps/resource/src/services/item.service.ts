import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ItemRequest } from '../dto/item-request.dto';
import { ItemDto } from '../dto/item.dto';
import { GoldPriceService } from './gold-price.service';
import { Repository } from 'typeorm';
import { BusinessException } from '../exceptions/business-exception';
import { StatusCode } from '../enums/status-code.enum';
import { Item } from '../models/item.model';
import { GoldPrice } from '../models/gold-price.model';
import { ValidateTokenResponse } from '../auth.interface';

@Injectable()
export class ItemService {
  constructor(
    @InjectRepository(Item)
    private readonly itemRepository: Repository<Item>,
    @InjectRepository(GoldPrice)
    private readonly goldPriceRepository: Repository<GoldPrice>,
    private readonly goldPriceService: GoldPriceService,
  ) {}

  // 아이템 생성 (판매자만 가능)
  async createItem(
    itemRequest: ItemRequest,
    userResponse: ValidateTokenResponse,
  ): Promise<void> {
    console.log('user role: ' + userResponse.role);
    if (userResponse.role !== 'SELLER') {
      throw new BusinessException('Error Create Item', StatusCode.FORBIDDEN);
    }

    // 금 가격 조회
    const goldPrice = await this.goldPriceRepository.findOne({
      where: { goldType: itemRequest.itemType },
    });

    let pricePerGram: number;

    if (goldPrice) {
      pricePerGram = goldPrice.price;
    } else {
      // 저장된 금 가격이 없을 경우 API 호출하여 조회 및 저장
      const goldPriceResponse = await this.goldPriceService.getGoldPriceInKRW(); // API 호출
      pricePerGram = this.goldPriceService.extractPriceFromResponse(
        goldPriceResponse,
        itemRequest.itemType,
      );

      // 해당 타입의 금 시세 저장
      await this.goldPriceService.saveGoldPrice(
        itemRequest.itemType,
        pricePerGram,
      );
    }

    const item = Item.createItem(
      itemRequest.itemType,
      pricePerGram,
      itemRequest.quantity,
      Number(userResponse.userId),
    );

    await this.itemRepository.save(item);
  }

  // 아이템 조회 (모든 사용자 가능)
  async getItemById(itemId: number): Promise<ItemDto> {
    const item = await this.findItemById(itemId);
    return ItemDto.fromEntity(item);
  }

  // 전체 아이템 목록 조회
  async getAllItems(): Promise<ItemDto[]> {
    const items = await this.itemRepository.find();
    return items.map((item) => ItemDto.fromEntity(item));
  }

  // 판매자의 등록 아이템 목록 조회
  async getItemsByUser(
    userResponse: ValidateTokenResponse,
  ): Promise<ItemDto[]> {
    const userId = Number(userResponse.userId);

    // Log userId after conversion to ensure it's a number
    console.log('seller id after conversion =', userId);
    if (isNaN(userId)) {
      throw new BadRequestException('Invalid userId');
    }

    const items = await this.itemRepository.find({
      where: { sellerId: userId },
    });
    return items.map((item) => ItemDto.fromEntity(item));
  }

  // 아이템 수정 (판매자만 가능)
  async updateItem(
    itemId: number,
    itemRequest: ItemRequest,
    userResponse: ValidateTokenResponse,
  ): Promise<void> {
    const item = await this.findItemById(itemId);

    if (item.sellerId !== Number(userResponse.userId)) {
      throw new BusinessException('', StatusCode.FORBIDDEN);
    }

    item.updateItem(itemRequest.itemType, itemRequest.quantity);

    await this.itemRepository.save(item);
  }

  // 아이템 삭제 (판매자만 가능)
  async deleteItem(
    itemId: number,
    userResponse: ValidateTokenResponse,
  ): Promise<void> {
    const item = await this.findItemById(itemId);

    if (item.sellerId !== Number(userResponse.userId)) {
      throw new BusinessException('', StatusCode.FORBIDDEN);
    }

    await this.itemRepository.delete(item.id);
  }

  private async findItemById(id: number): Promise<Item> {
    const item = await this.itemRepository.findOne({ where: { id: id } });
    if (!item) {
      throw new BusinessException('', StatusCode.ITEM_NOT_FOUND);
    }
    return item;
  }
}
