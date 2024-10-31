import { Controller, Get, HttpStatus } from '@nestjs/common';
import { GoldPriceService } from '../services/gold-price.service';
import { BaseApiResponse } from '@app/common';
import { GoldPriceDto } from '../dto/gold-price.dto';

@Controller('resource/goldPrice')
export class GoldPriceController {
  constructor(private readonly goldPriceService: GoldPriceService) {}

  @Get()
  async getPrice(): Promise<BaseApiResponse<GoldPriceDto[]>> {
    const price = await this.goldPriceService.getPrice();
    return BaseApiResponse.of(
      HttpStatus.OK,
      'All price retrieved successfully',
      price,
    );
  }

  @Get('update')
  async updatePrice() {
    await this.goldPriceService.updateGoldPrice();
    console.log('updated successfully');
  }
}
