import { PluginCommonModule, Type, VendurePlugin } from '@vendure/core';

import { FavoritesService } from './services/favorites.service';
import { FAVORITES_PLUGIN_OPTIONS } from './constants';
import { PluginInitOptions } from './types';
import { Favorite } from './entities/favorite.entity';

@VendurePlugin({
    imports: [PluginCommonModule],
    entities: [Favorite],
    providers: [
        FavoritesService,
        { provide: FAVORITES_PLUGIN_OPTIONS, useFactory: () => FavoritesPlugin.options },
    ],
    compatibility: '^2.0.0',
})
export class FavoritesPlugin {
    static options: PluginInitOptions;

    static init(options: PluginInitOptions): Type<FavoritesPlugin> {
        this.options = options;
        return FavoritesPlugin;
    }
}