import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InternalServerError, RequestContext, TransactionalConnection } from '@vendure/core';

import { SHOPPING_CAR_PLUGIN_OPTIONS } from '../constants';
import { PluginInitOptions } from '../types';
import { ShoppingCar } from '../entities/shopping-car.entity';
import { ShoppingCarProducts } from '../entities/shopping-car-products.entity';
import { shoppingCarToResponseMapper } from '../mappers';
import axios from 'axios';

@Injectable()
export class ShoppingCarService {
    constructor(
        private connection: TransactionalConnection,
        @Inject(SHOPPING_CAR_PLUGIN_OPTIONS) private options: PluginInitOptions,
    ) {}

    async exampleMethod(
        ctx: RequestContext,
        options?: { input?: string },
    ): Promise<string> {
        return options?.input ? 'Hello ${options.input}' : 'Hello World';
    }

    async create(
        data: { 
            ctx: RequestContext,
            data: { userId: string }
        }
    ): Promise<void> {
        const { ctx, data: { userId } } = data;

        const shoppingCar = new ShoppingCar({
            userId,
            isActivated: true,
        });

        await this.connection.getRepository(ctx, ShoppingCar).save(shoppingCar);
    }

    async findOne(
        data: { 
            ctx: RequestContext,
            options: { userId: string, isActivated: boolean }
        }
    ) {
        const { ctx, options } = data;
        
        const { userId, isActivated } = options;
        
        const shoppingCar = await this.connection.getRepository(ctx, ShoppingCar).findOne({
            where: {
                userId,
                isActivated,
            },
            relations: ['shoppingCarProducts', 'shoppingCarProducts.productVariant', 'shoppingCarProducts.productVariant.featuredAsset', 'shoppingCarProducts.productVariant.product.featuredAsset', 'shoppingCarProducts.productVariant.product', 'shoppingCarProducts.productVariant.stockLevels', 'shoppingCarProducts.productVariant.productVariantPrices'],
        });
        console.log('shoppingCar', shoppingCar)

        if (!shoppingCar) {
            return null;
        }

        const siteId = 1 // siteId -> the id of the site

        const url = `${process.env.BACKEND_GAMIFICATION_URL}/gamification/point_value/${siteId}`

        // const pointsValueRequest = await axios.get(url)

        const pointValue: number = 1000;
        // const pointValue: number = pointsValueRequest.data.point_value

        return shoppingCarToResponseMapper(shoppingCar, pointValue);
    }

    async addProduct(
        payload: { 
            ctx: RequestContext,
            data: { userId: string, productVariantId: number, quantity: number, isPaidWithPoints: boolean }
        }
    ) {
        const { ctx, data: { userId, productVariantId, quantity, isPaidWithPoints } } = payload;

        let shoppingCar = await this.connection.getRepository(ctx, ShoppingCar).findOne({
            where: {
                userId,
                isActivated: true,
            },
            relations: ['shoppingCarProducts', 'shoppingCarProducts.productVariant', 'shoppingCarProducts.productVariant.featuredAsset', 'shoppingCarProducts.productVariant.product.featuredAsset', 'shoppingCarProducts.productVariant.product', 'shoppingCarProducts.productVariant.stockLevels', 'shoppingCarProducts.productVariant.productVariantPrices'],
        });

        if (!shoppingCar) {
            shoppingCar = new ShoppingCar({
                userId,
                isActivated: true,
                shoppingCarProducts: [],
            });

            await this.connection.getRepository(ctx, ShoppingCar).save(shoppingCar);
        };

        const shoppingCarProduct = shoppingCar.shoppingCarProducts.find(shoppingCarProduct => shoppingCarProduct.productVariant.id === productVariantId);

        if (shoppingCarProduct) {
            return await this.connection.getRepository(ctx, ShoppingCarProducts).save({
                id: shoppingCarProduct.id,
                quantity,
            })
        } 

        const newShoppingCarProduct = new ShoppingCarProducts({
            shoppingCar,
            productVariantId,
            quantity,
            isPaidWithPoints,
            shoppingCarId: shoppingCar.id,
        });

        await this.connection.getRepository(ctx, ShoppingCarProducts).save(newShoppingCarProduct);

        return true;
    }

    async removeProduct(
        payload: { 
            ctx: RequestContext,
            data: { userId: string, productVariantId: number }
        }
    ) {
        const { ctx, data: { userId, productVariantId } } = payload;

        const shoppingCar = await this.connection.getRepository(ctx, ShoppingCar).findOne({
            where: {
                userId,
                isActivated: true,
            },
            relations: ['shoppingCarProducts', 'shoppingCarProducts.productVariant', 'shoppingCarProducts.productVariant.featuredAsset', 'shoppingCarProducts.productVariant.product.featuredAsset', 'shoppingCarProducts.productVariant.product', 'shoppingCarProducts.productVariant.stockLevels', 'shoppingCarProducts.productVariant.productVariantPrices'],
        });

        if (!shoppingCar) {
            throw new NotFoundException(`El carrito de compras del usuario ${userId} no existe`);
        };

        const shoppingCarProduct = shoppingCar.shoppingCarProducts.find(shoppingCarProduct => shoppingCarProduct.productVariant.id === productVariantId);

        if (!shoppingCarProduct) {
            throw new NotFoundException(`El producto con id ${productVariantId} no existe en el carrito de compras del usuario ${userId}`);
        }   

        const removedProduct = await this.connection.getRepository(ctx, ShoppingCarProducts).remove(shoppingCarProduct);

        if (!removedProduct) {
            throw new InternalServerError(`Error al eliminar el producto con id ${productVariantId} del carrito de compras del usuario`);
        }

        return true;
    }

    async deactivate(
        data: { 
            ctx: RequestContext,
            options: { userId: string }
        }
    ) {
        const { ctx, options } = data;

        const { userId } = options;

        const shoppingCar = await this.connection.getRepository(ctx, ShoppingCar).findOne({
            where: {
                userId,
                isActivated: true,
            },
        });

        if (!shoppingCar) {
            throw new NotFoundException(`El carrito de compras del usuario ${userId} no existe`);
        };

        return await this.connection.getRepository(ctx, ShoppingCar).save({
            id: shoppingCar.id,
            isActivated: false,
        });
    }
}