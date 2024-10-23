// Shopping car controller
// --------------------
// This file contains the controller for the shopping car endpoint. It is responsible for
// handling incoming requests and returning data to the client. The controller is
// registered in the `shoppingCarPlugin` file.
// --------------------
import { Controller, Post, Delete, Get, Put, NotFoundException, BadRequestException } from '@nestjs/common';
import { Ctx, RequestContext,ProductVariantService, ProductVariant, ListQueryOptions, CollectionService, TransactionalConnection, ID, InternalServerError } from '@vendure/core';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';

// resources
import { ShoppingCarService } from '../services/shopping-car.service';
import { Buy } from '../dtos/buy.dto';

@Controller('shopping-car')
export class ShoppingCarController {
    constructor(private shoppingCarService: ShoppingCarService, private productVariantService: ProductVariantService, private collectionService: CollectionService, private connection: TransactionalConnection) {
    }

    @Get()
    async findOne(@Ctx() ctx: RequestContext) {
        const userId = ctx.req?.headers?.user_id;

        if (!userId || Array.isArray(userId)){
            throw new BadRequestException('El usuario no está autenticado');
        }

        //TODO get the site if from the params

        const url = `${process.env.BACKEND_ADMIN_GAMIFICATION_URL}/gamification/point_value/1`

     // get the point value from the gamification service
        const pointsValueRequest = await fetch(url, { 
            method: "GET", 
            headers: { 'Content-Type': 'application/json' },
            }
        ).then((response) => response.json() );
        

        const pointValue: number = pointsValueRequest?.point_value ||  0

        const shoppingCar = await this.shoppingCarService.findOne({
            ctx,
            options: {
                userId,
                isActivated: true,
            }
        });

        if (!shoppingCar) {
            await this.shoppingCarService.create({
                ctx,
                data: {
                    userId,
                }
            });

            const shoppingCar = await this.shoppingCarService.findOne({
                ctx,
                options: {
                    userId,
                    isActivated: true,
                }
            });

            const productToReturn = shoppingCar!.products.map((product) => {
                return {
                   ...product,
                   points: Math.floor(product.price / pointValue)
                }
            })

            const productResponse = {
                ...shoppingCar,
                products: productToReturn ?? []
            }

            return productResponse
        }


        const productToReturn = shoppingCar!.products.map((product) => {
            return {
               ...product,
               points: Math.floor(product.price / pointValue) 
            }
        })

        const productResponse = {
            ...shoppingCar,
            products: productToReturn ?? []
        }

        return productResponse
    }

    @Get('total-products')
    async getTotalProducts(@Ctx() ctx: RequestContext) {

        const userId = ctx.req?.headers?.user_id;

        if (!userId || Array.isArray(userId)){
            throw new BadRequestException('El usuario no está autenticado');
        }

        const shoppingCar = await this.shoppingCarService.findOne({
            ctx,
            options: {
                userId,
                isActivated: true,
            }
        });

        if (!shoppingCar) return 0;

        const totalProducts = shoppingCar.products.length;

        return totalProducts;
    }

    @Post()
    async create(@Ctx() ctx: RequestContext) {
        const userId = ctx.req?.headers?.user_id;

        if (!userId || Array.isArray(userId)){
            throw new BadRequestException('El usuario no está autenticado');
        }

        await this.shoppingCarService.create({
            ctx,
            data: {
                userId,
            }
        });
    }

    @Post('buy')
    async buyWithPoints(@Ctx() ctx: RequestContext) {
        const userId = ctx.req?.headers?.user_id;
        const token = ctx.req?.headers?.authorization?.split(' ')[1];


        if (!userId || Array.isArray(userId)){
            throw new BadRequestException('El usuario no está autenticado');
        }

       const body: Buy = ctx.req?.body;

       const orderId = uuidv4();

        if (body.moneyAmount > 0 || body.pointsAmount <= 0) {
            throw new BadRequestException('No se puede realizar la compra');
        }

        const shoppingCar = await this.shoppingCarService.findOne({
            ctx,
            options: {
                userId,
                isActivated: true,
            }
        });

        if (!shoppingCar) {
            throw new NotFoundException('El carrito de compras no existe');
        }

        const shoppingCarUpdated = await this.shoppingCarService.deactivate({
            ctx,
            options: {
                userId,
            }
        });

        if (!shoppingCarUpdated) {
            throw new InternalServerError('Error al desactivar el carrito de compras');
        }

        const url = `${process.env.BACKEND_GAMIFICATION_URL}/payment/create`

        const data = {
            gateway_id: 1,
            amount: body.pointsAmount,
            userId: userId,
            status: true,
            order_id: orderId,
            data:body.data
        }

        const res = await axios.post(url, data, {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        })

        if (res.status !== 201) {
            throw new InternalServerError('Error al realizar el pago');
        }

        return {
            info: res.data,
            status:true
        };
    }

    @Put('add-product')
    async addProduct(@Ctx() ctx: RequestContext) {
        const userId = ctx.req?.headers?.user_id;

        if (!userId || Array.isArray(userId)){
            throw new BadRequestException('El usuario no está autenticado');
        }

        const { productVariantId, isPaidWithPoints, quantity } = ctx.req?.body;

        const shoppingCar = await this.shoppingCarService.findOne({
            ctx,
            options: {
                userId,
                isActivated: true,
            }
        });

        const productVariant = await this.productVariantService.findOne(ctx, productVariantId);

        if (!productVariant) {
            throw new NotFoundException(`El producto con id ${productVariantId} no existe`);
        }

        return await this.shoppingCarService.addProduct({
            ctx,
            data: {
                userId,
                productVariantId,
                isPaidWithPoints,
                quantity,
            }
        })
    }

    @Delete('remove-product/:productVariantId')
    async removeProduct(@Ctx() ctx: RequestContext) {
        const userId = ctx.req?.headers?.user_id;

        if (!userId || Array.isArray(userId)){
            throw new BadRequestException('El usuario no está autenticado');
        }

        const  productVariantId  = Number(ctx.req?.params.productVariantId);

        const productVariant = await this.productVariantService.findOne(ctx, productVariantId);

        if (!productVariant) {
            throw new NotFoundException(`El producto con id ${productVariantId} no existe`);
        }

        return await this.shoppingCarService.removeProduct({
            ctx,
            data: {
                userId,
                productVariantId,
            }
        })
    }
}