import { Inject, Injectable } from '@nestjs/common';
import { RequestContext, TransactionalConnection, ListQueryBuilder } from '@vendure/core';

import { POINTS_PLUGIN_OPTIONS } from '../constants';
import { PluginInitOptions } from '../types';
import { Points  } from '../entities/points.entity';

@Injectable()
export class PointsService {
    constructor(
        private connection: TransactionalConnection,
        @Inject(POINTS_PLUGIN_OPTIONS) private options: PluginInitOptions,
    ) {}

    async exampleMethod(
        ctx: RequestContext,
        options?: { input?: string },
    ): Promise<string> {
        return options?.input ? 'Hello ${options.input}' : 'Hello World';
    }

    async findOne(
        data: { 
            ctx: RequestContext,
            options: { id: string }
        }
    ): Promise<Points[]> {
        const { ctx, options } = data;
        
        const { id } = options;
        
        // const points = await this.connection.getRepository(ctx, Points).find({
        //     where: {
        //         id,
        //     },
        //     relations: ['productVariant', 'productVariant.featuredAsset', 'productVariant.product.featuredAsset', 'productVariant.product', 'productVariant.stockLevels'],
        // });

        // return points;
        return [];
    }


}