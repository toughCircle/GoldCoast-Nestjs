import { GoldPrice } from '../models/gold-price.model';

export class GoldPriceDto {
  goldType: string;

  price: number;

  updatedAt: Date;

  static fromEntity(goldPrice: GoldPrice) {
    const goldPriceDto = new GoldPriceDto();
    goldPriceDto.goldType = goldPrice.goldType;
    goldPriceDto.price = goldPrice.price;
    goldPriceDto.updatedAt = goldPrice.updatedAt;

    return goldPriceDto;
  }
}
