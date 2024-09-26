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
        console.log("🚀 ~ ProductsController ~ findAll - 62 ~ dbResponse:", dbResponse)

        const dbResponseTest = await this.productVariantService.getVariantsByCollectionId(ctx, collectionId, options)
        console.log("🚀 ~ ProductsController ~ findAll - 65 ~ dbResponseTest:", dbResponseTest)

        // get the point value from the gamification service
        const siteId = 1 // siteId -> the id of the site
        const userId = ctx.req?.headers?.user_id || 'b26ab80f-ce92-4ef2-8d8c-a098d8bf69b1';
        const page = queryParam.page || 1
        const limit = queryParam.limit || 10
        const type = queryParam.type || 0

        const url = `${process.env.BACKEND_GAMIFICATION_URL}/gamification/point_value/filter-pagination/${siteId}/${userId}/${page}/${limit}/${type}`

        console.log('Por acá ingresó al consultar productos - 76', ctx.req?.query, url);
        // const pointsValueRequest = await axios.get(url)
        const pointsValueRequest = await fetch(url, { 
            method: "GET", 
            headers: { 'Content-Type': 'application/json' },
            }
        ).then((response) => response.json() );
        console.log("🚀 ~ ProductsController ~ findAll - 83 ~ pointsValueRequest:", pointsValueRequest)

        const pointValue: number = pointsValueRequest?.data?.point_value
        console.log("🚀 ~ ProductsController ~ findAll - 86 ~ pointValue:", pointValue)


        if (!userId || Array.isArray(userId)){
            throw new BadRequestException('El usuario no está autenticado');
        }

        const favorites = await this.favoritesService.findAll({ctx, options: { userId }});
        console.log("🚀 ~ ProductsController ~ findAll - 94 ~ favorites:", favorites)

        const favoritesProductVariantsIds = favorites.map(favorite => Number(favorite.productVariant.id));
        console.log("🚀 ~ ProductsController ~ findAll - 97 ~ favoritesProductVariantsIds:", favoritesProductVariantsIds)

        const items = productsToResponse(dbResponse.items, pointValue, favoritesProductVariantsIds);
        console.log("🚀 ~ ProductsController ~ findAll - 100 ~ items:", JSON.stringify(items))

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
        // get the point value from the gamification service
        const siteId = 1 // siteId -> the id of the site
        const userId = ctx.req?.headers?.user_id as string || 'b26ab80f-ce92-4ef2-8d8c-a098d8bf69b1';
        const page = queryParam.page || 1
        const limit = queryParam.limit || 1
        const type = queryParam.type || 0

        const favorites = await this.favoritesService.findAll({ctx, options: { userId }});
      

        const url = `${process.env.BACKEND_GAMIFICATION_URL}/gamification/point_value/filter-pagination/${siteId}/${userId}/${page}/${limit}/${type}`
       
        try {

        let pointValue = 0

        const pointsValueRequest = await axios.get(url)

        if (pointsValueRequest.status === 404) {
            pointValue = 0
        } else {
            pointValue = pointsValueRequest?.data[0]?.points
        }


        if (!userId || Array.isArray(userId)){
            throw new BadRequestException('El usuario no está autenticado');
        }

        
        const favoritesProductVariantsIds = favorites.map(favorite => Number(favorite.productVariant.id));

        const [response] = productsToResponse([product], pointValue, favoritesProductVariantsIds);

        return {item: response};

        } catch(error:any) {
            console.log("🔴🔴🔴🔴", error);
        }
        
    }

    // @Get(':id')
    // async findOne(@Ctx() ctx: RequestContext) {
    //     console.log(" ✅✅✅✅✅✅✅ id ✅✅✅✅✅✅")
    //     const id = ctx.req?.params.id // id of the product
    //     const queryParam: any = ctx.req?.query 

    //     if (!id) {
    //         // throw new Error('No id provided');
    //         console.log('167 - No id provided');
    //         return { item: null };
    //     }

    //     const product = await this.productVariantService.findOne(ctx, id, ['featuredAsset','stockLevels','product', 'product.featuredAsset', 'productVariantPrices'])
    //     console.log("🚀 ~ ProductsController ~ findOne - 172 - ~ product:", product)

        

    //     //todo:make the point request here...
    //     // const responseDB = await this.pointsService.findOne({ctx, options: { id: '76' }});
    //     // console.log("🚀 ~ ProductsController ~ findOne ~ responseDB:", responseDB)
    //     console.log('SEEING THE ID:: 👌👌', id);

    //     if (!product) {
    //         // throw new Error('No product found');
    //         console.log('182 - No product found');
    //         return { item: null };
    //     }
        
    //     // get the point value from the gamification service
    //     // get the point value from the gamification service
    //     const siteId = 1 // siteId -> the id of the site
    //     const userId = ctx.req?.headers?.user_id as string || 'b26ab80f-ce92-4ef2-8d8c-a098d8bf69b1';
    //     const page = queryParam.page || 1
    //     const limit = queryParam.limit || 1
    //     const type = queryParam.type || 0

    //     const favorites = await this.favoritesService.findAll({ctx, options: { userId }});
    //     console.log("🚀 ~ ProductsController ~ findOne ~ favorites:", favorites)

    //     const url = `${process.env.BACKEND_GAMIFICATION_URL}/gamification/point_value/filter-pagination/${siteId}/${userId}/${page}/${limit}/${type}`

    //     const pointsValueRequest = await axios.get(url)

    //     const pointValue: number = pointsValueRequest.data.point_value

    //     console.log('SEEING THE POINTS 🧠🧠', pointValue);

    //     if (!userId || Array.isArray(userId)){
    //         // throw new BadRequestException('El usuario no está autenticado');
    //         console.log('El usuario no está autenticado');
    //         return {item: null};
    //     }

        

    //     const favoritesProductVariantsIds = favorites.map(favorite => Number(favorite.productVariant.id));
    //     console.log("💊 - 214", { product, pointValue, favoritesProductVariantsIds });
    //     const [response] = productsToResponse([product], pointValue, favoritesProductVariantsIds);
    //     console.log("🚀 ~ ProductsController ~ findOne - 210* - ~ response:", response)
    //     return {item: response};
    // }

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