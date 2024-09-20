import { PluginCommonModule, Type, VendurePlugin } from '@vendure/core';
import { ShoppingCarService } from './services/shopping-car.service';
import { SHOPPING_CAR_PLUGIN_OPTIONS } from './constants';
import { PluginInitOptions } from './types';
import { ShoppingCar } from './entities/shopping-car.entity';
import { ShoppingCarProducts } from './entities/shopping-car-products.entity';
import { ShoppingCarController } from './controllers/shopping-car.controller';


@VendurePlugin({
    imports: [PluginCommonModule],
    entities: [ShoppingCar, ShoppingCarProducts],
    providers: [
        ShoppingCarService,
        { provide: SHOPPING_CAR_PLUGIN_OPTIONS, useFactory: () => ShoppingCarPlugin.options },
    ],
    compatibility: '^2.0.0',
    controllers: [ShoppingCarController],
})
export class ShoppingCarPlugin {
    static options: PluginInitOptions;

    static init(options: PluginInitOptions): Type<ShoppingCarPlugin> {
        this.options = options;
        return ShoppingCarPlugin;
    }
}