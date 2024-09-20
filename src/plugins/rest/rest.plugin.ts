import { PluginCommonModule, VendurePlugin } from '@vendure/core';
import { FavoritesPlugin } from '../favorites/favorites.plugin';
import { CollectionsController } from './api/collections/collection.controller';
import { ProductsController } from './api/products/products.controller';
import { PointsPlugin } from '../points/points.plugin';

@VendurePlugin({
  imports: [PluginCommonModule, FavoritesPlugin, PointsPlugin],
  controllers: [ProductsController, CollectionsController],
})
export class RestPlugin {}