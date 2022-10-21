import { Injectable, Module, Scope } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoffeesController } from './coffees.controller';
import { CoffeesService } from './coffees.service';
import { Coffee } from './entities/coffee.entity';
import { Flavor } from './entities/flavor.entity';
import { Event } from '../events/entities/event.entity';
import { COFFEE_BRANDS } from './coffees.constants';
import { Connection } from 'typeorm';
import { ConfigModule } from '@nestjs/config';
import coffeesConfig from './config/coffees.config';

//Formation CHAPTER Providers
//class ConfigService {}
//class DevelopmentConfigService {}
//class ProductionConfigService {}

@Injectable()
export class CoffeeBrandsFactory {
  create() {
    /* ... do something ... */
    return ['buddy brew', 'nescafe'];
  }
}

@Module({
  exports: [CoffeesService],
  imports: [
    TypeOrmModule.forFeature([Coffee, Flavor, Event]),
    ConfigModule.forFeature(coffeesConfig),
  ],
  controllers: [CoffeesController],
  providers: [
    CoffeesService,
    CoffeeBrandsFactory,
    {
      provide: COFFEE_BRANDS,
      useFactory: async (connection: Connection): Promise<string[]> => {
        const brands = await Promise.resolve(['buddy brew', 'nescafe']);
        console.log('[!] Async Factory');

        return brands;
      },
      inject: [Connection],
      scope: Scope.TRANSIENT,
    },
    //Formation CHAPTER Providers
    /* {
      provide: ConfigService,
      useClass:
        process.env.NODE_ENV === 'development'
          ? DevelopmentConfigService
          : ProductionConfigService,
    }, */
  ],
})
export class CoffeesModule {}
