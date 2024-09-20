import { PluginCommonModule, Type, VendurePlugin } from '@vendure/core';

import { PointsService } from './service/points.service';
import { POINTS_PLUGIN_OPTIONS } from './constants';
import { PluginInitOptions } from './types';
import { Points } from './entities/points.entity';

@VendurePlugin({
    imports: [PluginCommonModule],
    entities: [Points],
    providers: [
        PointsService,
        { provide: POINTS_PLUGIN_OPTIONS, useFactory: () => PointsPlugin.options },
    ],
    compatibility: '^2.0.0',
})
export class PointsPlugin {
    static options: PluginInitOptions;

    static init(options: PluginInitOptions): Type<PointsPlugin> {
        this.options = options;
        return PointsPlugin;
    }
}