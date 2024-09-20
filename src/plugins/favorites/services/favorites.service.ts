import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { RequestContext, TransactionalConnection, ListQueryBuilder } from '@vendure/core';

import { FAVORITES_PLUGIN_OPTIONS } from '../constants';
import { PluginInitOptions } from '../types';
import { Favorite } from '../entities/favorite.entity';

@Injectable()
export class FavoritesService {
    constructor(
        private connection: TransactionalConnection,
        private listQueryBuilder: ListQueryBuilder,
        @Inject(FAVORITES_PLUGIN_OPTIONS) private options: PluginInitOptions,
    ) {}

    async exampleMethod(
        ctx: RequestContext,
        options?: { input?: string },
    ): Promise<string> {
        return options?.input ? 'Hello ${options.input}' : 'Hello World';
    }

    async findAll(
        data: { 
            ctx: RequestContext,
            options: { userId: string }
        }
    ): Promise<Favorite[]> {
        const { ctx, options } = data;
        
        const { userId } = options;
        
        const favorites = await this.connection.getRepository(ctx, Favorite).find({
            where: {
                userId,
            },
            relations: ['productVariant', 'productVariant.featuredAsset', 'productVariant.product.featuredAsset', 'productVariant.product', 'productVariant.stockLevels'],
        });

        return favorites;
    }

    async create(
        data: { 
            ctx: RequestContext,
            data: { userId: string, productVariantId: number }
        }
    ): Promise<Favorite> {
        const { ctx, data: { userId, productVariantId } } = data;

        const favorite = new Favorite({
            userId,
            productVariantId,
        });

        await this.connection.getRepository(ctx, Favorite).save(favorite);

        return favorite;
    }

    async deleteFavorite(
        data: { 
            ctx: RequestContext,
            userId: string,
            productVariantId: number
        }
    ): Promise<boolean> {
        const { ctx, userId, productVariantId } = data;

        const favorite = await this.connection.getRepository(ctx, Favorite).findOne({
            where: {
                productVariantId,
                userId,
            },
        });

        if (!favorite) {
            throw new NotFoundException("Favorito no encontrado");
        }

        await this.connection.getRepository(ctx, Favorite).remove(favorite);

        return true;
    }
}