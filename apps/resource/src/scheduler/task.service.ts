import { Injectable } from '@nestjs/common';
import { GoldPriceService } from '../services/gold-price.service';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class TaskService {
  constructor(private readonly goldPriceService: GoldPriceService) {}

  @Cron('0 0 16 * * 1-5')
  firstPriceUpdateService() {
    this.goldPriceService.updateGoldPrice();
  }

  @Cron('0 0 23 * * 1-5')
  secondPriceUpdateService() {
    this.goldPriceService.updateGoldPrice();
  }
}
