// Products controller
// --------------------
// This file contains the controller for the products endpoint. It is responsible for
// handling incoming requests and returning data to the client. The controller is
// registered in the `RestPlugin` file.
// --------------------
import { Controller, Post, Delete, Get, BadRequestException } from '@nestjs/common';
import { Ctx, RequestContext,ProductVariantService, ProductVariant, ListQueryOptions, CollectionService } from '@vendure/core';
import axios from 'axios';

// resources
import { FavoritesService } from '../../../favorites/services/favorites.service';
import { PointsService } from '../../../points/service/points.service';
import { favoritesToResponse, productsToResponse } from './mappers';

@Controller('products')
export class ProductsController {
    constructor(private productVariantService: ProductVariantService, private favoritesService: FavoritesService, private collectionService: CollectionService, private pointsService: PointsService) {
    }

    @Get()
    async findAll(@Ctx() ctx: RequestContext) {
      
        const queryParam: any = ctx.req?.query // queryParam -> the query parameters

        const { collectionId,  maxPrice, minPrice, sortBy } = queryParam  // skip -> the number of products to skip, take -> the number of products to take
        
        const take = queryParam.take ? Number(queryParam.take): 12
        
        const options: ListQueryOptions<ProductVariant> = { take, skip: 0 }

        if (maxPrice && minPrice) {
            options.filter = {
                price: {
                    between: {
                        start: minPrice * 100,
                        end: maxPrice * 100
                    }
                }
            }
        }

        if (sortBy === "sortByMostRecent") {
            options.sort = {
                createdAt: 'DESC'
            }
        }

        if (sortBy === "sortByMaxPrice") {
            options.sort = {
                price: 'DESC'
            }
        }

        if (sortBy === "sortByMinPrice") {
            options.sort = {
                price: 'ASC'
            }
        }

        const dbResponse = await this.productVariantService.getVariantsByCollectionId(ctx, collectionId, options, ['featuredAsset', 'product', 'productVariantPrices', 'product.featuredAsset','stockLevels'])

        /*TODO: receive siteID from the frontend  */
        const siteId = 1 // siteId -> the id of the site
        const userId = ctx.req?.headers?.user_id || 'b26ab80f-ce92-4ef2-8d8c-a098d8bf69b1';

        const url = `${process.env.BACKEND_ADMIN_GAMIFICATION_URL}/gamification/point_value/${siteId}`

     // get the point value from the gamification service
        const pointsValueRequest = await fetch(url, { 
            method: "GET", 
            headers: { 'Content-Type': 'application/json' },
            }
        ).then((response) => response.json() );
        

        const pointValue: number = pointsValueRequest?.point_value ||  0
       
    
        if (!userId || Array.isArray(userId)){
            throw new BadRequestException('El usuario no está autenticado');
        }

        const favorites = await this.favoritesService.findAll({ctx, options: { userId }});
     

        const favoritesProductVariantsIds = favorites.map(favorite => Number(favorite.productVariant.id));
      

        const items = productsToResponse(dbResponse.items, pointValue, favoritesProductVariantsIds);

        return { items, totalItems: dbResponse.totalItems };
    }

    @Get('max-price')
    async getMaxPrice(@Ctx() ctx: RequestContext) {
   
        const queryParam: any = ctx.req?.query 

        const { collectionId } = queryParam 
        
        const options: ListQueryOptions<ProductVariant> = { skip: 0, take: 1, sort: { price: 'DESC' } }

        const dbResponse = await this.productVariantService.getVariantsByCollectionId(ctx, collectionId, options)

        return {maxPrice: dbResponse.items[0].price / 100};
    }

    @Get('favorites')
    async getFavorites(@Ctx() ctx: RequestContext) {

        const queryParam: any = ctx.req?.query
        
        const userId = ctx.req?.headers?.user_id;
        const page = queryParam.page || 1
        const limit = queryParam.limit || 1
        const type = queryParam.type || 0


        if (!userId || Array.isArray(userId)){
            throw new BadRequestException('El usuario no está autenticado');
        }

        const favorites = await this.favoritesService.findAll({ctx, options: { userId }});
    
        const siteId = 1 // siteId -> the id of the site

        const url = `${process.env.BACKEND_GAMIFICATION_URL}/gamification/point_value/filter-pagination/${siteId}/${userId}/${page}/${limit}/${type}`

        const pointsValueRequest = await axios.get(url)

        const pointValue: number = pointsValueRequest.data.point_value

        const items = favoritesToResponse(favorites, pointValue);

        return { items };
    }

    @Get('points')
    async getPoints(@Ctx() ctx: RequestContext) {
    
        const dbResponse = await this.collectionService.findOneBySlug(ctx, 'puntos', ['productVariants', 'productVariants.product', 'productVariants.product.featuredAsset', 'productVariants.productVariantPrices', 'productVariants.featuredAsset', 'productVariants.stockLevels'])

        if (!dbResponse) {
            throw new Error('No collection found');
        }

        const items = productsToResponse(dbResponse?.productVariants, 1, []);
        
        return { items };
    }

    @Get(':id')
    async findOne(@Ctx() ctx: RequestContext) {
        const id = ctx.req?.params.id // id of the product
        const queryParam: any = ctx.req?.query 

        if (!id) {
            throw new Error('No id provided');
        }

        const product = await this.productVariantService.findOne(ctx, id, ['featuredAsset','stockLevels','product', 'product.featuredAsset', 'productVariantPrices'])


        if (!product) {
            throw new Error('No product found');
        }
        
        // get the point value from the gamification service
      
        /*TODO: receive siteID from the frontend  */
        const siteId = 1 // siteId -> the id of the site
        const userId = ctx.req?.headers?.user_id as string || 'b26ab80f-ce92-4ef2-8d8c-a098d8bf69b1';
    

        const favorites = await this.favoritesService.findAll({ctx, options: { userId }});
      

        const url = `${process.env.BACKEND_ADMIN_GAMIFICATION_URL}/gamification/point_value/${siteId}`
       

          // get the point value from the gamification service
          const pointsValueRequest = await fetch(url, { 
            method: "GET", 
            headers: { 'Content-Type': 'application/json' },
            }
        ).then((response) => response.json() );
        

        const pointValue: number = pointsValueRequest?.point_value ||  0

        if (!userId || Array.isArray(userId)){
            throw new BadRequestException('El usuario no está autenticado');
        }

        
        const favoritesProductVariantsIds = favorites.map(favorite => Number(favorite.productVariant.id));

        const [response] = productsToResponse([product], pointValue, favoritesProductVariantsIds);

        return {item: response};

    }

    @Post(':productVariantId/favorite')
    async createFavorite(@Ctx() ctx: RequestContext) {
      
        const productVariantId = ctx.req?.params.productVariantId // id of the product

        if (!productVariantId) {
            throw new Error('No id provided');
        }

        const userId = ctx.req?.headers?.user_id;

        if (!userId || Array.isArray(userId)){
            throw new BadRequestException('El usuario no está autenticado');
        }

        const favorite = await this.favoritesService.create({ctx, data: { userId, productVariantId: Number(productVariantId) }});

        return favorite;
    }

    @Delete(':productVariantId/favorite')
    async deleteFavorite(@Ctx() ctx: RequestContext) {
     
        const productVariantId = ctx.req?.params.productVariantId // productVariantId of the product

        if (!productVariantId) {
            throw new Error('No productVariantId provided');
        }

        const userId = ctx.req?.headers?.user_id;

        if (!userId || Array.isArray(userId)){
            throw new BadRequestException('El usuario no está autenticado');
        }

        const deleted = await this.favoritesService.deleteFavorite({ctx, userId, productVariantId: Number(productVariantId)});

        return deleted;
    }
}