import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ItemType } from '../enums/item-type.enum';
import { BusinessException } from '../exceptions/business-exception';
import { StatusCode } from '../enums/status-code.enum';
import { GoldPrice } from '../models/gold-price.model';
import { appConfig } from '../config/config';
import { response } from 'express';

@Injectable()
export class GoldPriceService {
  constructor(
    @InjectRepository(GoldPrice)
    private readonly goldPriceRepository: Repository<GoldPrice>,
  ) {}

  // API로부터 금 시세 가져오기
  async getGoldPriceInKRW(): Promise<any> {
    const symbol = 'XAU';
    const currency = 'KRW';
    const apiKey = appConfig.apis.apiKey;
    const baseUrl = appConfig.apis.apiUrl;
    const url = `${baseUrl}/${symbol}/${currency}`;

    const headers = new Headers();

    headers.append('x-access-token', apiKey);
    headers.append('Content-Type', 'application/json');

    const requestOptions = {
      method: 'GET',
      headers: headers,
      redirect: 'follow' as RequestRedirect,
    };

    fetch(`${url}/${symbol}/${currency}`, requestOptions)
      .then((response) => response.text())
      .then((result) => console.log(result))
      .catch((error) => new BusinessException(error, StatusCode.BAD_REQUEST));

    return response;
  }

  // API 응답에서 필요한 금 시세 추출
  extractPriceFromResponse(goldPriceResponse: any, itemType: string): number {
    try {
      console.log('Parsed response:', goldPriceResponse);

      let pricePerGram = 0;

      switch (itemType) {
        case 'GOLD_24':
          pricePerGram = Number(goldPriceResponse.price_gram_24k);
          break;
        case 'GOLD_22':
          pricePerGram = Number(goldPriceResponse.price_gram_22k);
          break;
        case 'GOLD_21':
          pricePerGram = Number(goldPriceResponse.price_gram_21k);
          break;
        case 'GOLD_18':
          pricePerGram = Number(goldPriceResponse.price_gram_18k);
          break;
        default:
          throw new BadRequestException(`Unsupported item type: ${itemType}`);
      }

      return Math.round(pricePerGram);
    } catch (error) {
      console.error('Error while extracting price: ', error.message);
      throw new BusinessException(
        'Error parsing gold price',
        StatusCode.BAD_REQUEST,
      );
    }
  }

  // 금 시세 업데이트 로직
  async updateGoldPrice(): Promise<void> {
    const goldPriceResponse = await this.getGoldPriceInKRW();
    const pricePerGram24k = this.extractPriceFromResponse(
      goldPriceResponse,
      ItemType.GOLD_24,
    );
    const pricePerGram22k = this.extractPriceFromResponse(
      goldPriceResponse,
      ItemType.GOLD_22,
    );
    const pricePerGram21k = this.extractPriceFromResponse(
      goldPriceResponse,
      ItemType.GOLD_21,
    );
    const pricePerGram18k = this.extractPriceFromResponse(
      goldPriceResponse,
      ItemType.GOLD_18,
    );

    // 저장 또는 업데이트
    await this.saveGoldPrice(ItemType.GOLD_24, pricePerGram24k);
    await this.saveGoldPrice(ItemType.GOLD_22, pricePerGram22k);
    await this.saveGoldPrice(ItemType.GOLD_21, pricePerGram21k);
    await this.saveGoldPrice(ItemType.GOLD_18, pricePerGram18k);
  }

  // 금 시세 저장 또는 업데이트 메서드
  async saveGoldPrice(itemType: ItemType, pricePerGram: number): Promise<void> {
    const existingGoldPrice = await this.goldPriceRepository.findOne({
      where: { goldType: itemType },
    });

    if (!existingGoldPrice) {
      const goldPrice = GoldPrice.createGoldPrice(itemType, pricePerGram);
      await this.goldPriceRepository.save(goldPrice);
    } else if (existingGoldPrice.price !== pricePerGram) {
      existingGoldPrice.updatePrice(pricePerGram);
      await this.goldPriceRepository.save(existingGoldPrice);
    }
  }
}
