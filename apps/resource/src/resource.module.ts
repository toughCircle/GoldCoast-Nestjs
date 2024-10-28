import { Module } from '@nestjs/common';
import { ItemController } from './controllers/item.controller';
import { AuthService } from './services/auth.service';
import { CommonService } from '@app/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { ItemService } from './services/item.service';
import { GoldPriceService } from './services/gold-price.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GoldPrice } from './models/gold-price.model';
import { Item } from './models/item.model';
import { Order } from './models/order.model';
import { Address } from './models/address.model';
import { DBConfigModule } from './config/db-config.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    DBConfigModule,
    HttpModule,
    TypeOrmModule.forFeature([Item, GoldPrice, Order, Address]),
    ClientsModule.register([
      {
        name: 'AUTH_SERVICE',
        transport: Transport.GRPC,
        options: {
          package: 'auth',
          protoPath: join(process.cwd(), 'libs/common/src/proto/auth.proto'),
          url: 'auth-server:5001',
        },
      },
    ]),
  ],
  controllers: [ItemController],
  providers: [AuthService, CommonService, ItemService, GoldPriceService],
  exports: [ItemService],
})
export class ResourceModule {}
