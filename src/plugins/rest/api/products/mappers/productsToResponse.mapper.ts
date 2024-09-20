import { Translated, ProductVariant } from "@vendure/core";

import { ProductResponse } from "../dtos";

export const productsToResponse = (items: Translated<ProductVariant>[], pointValue:number, favoritesProductVariantsIds: number[]): ProductResponse[] => {
    return items.map(item => {
        const id = Number(item.id);

        const image =  item.featuredAsset?.source || item.product?.featuredAsset?.source || '';
        
        const isInFavorite = favoritesProductVariantsIds.includes(id);

        const price = item.price ? item.price / 100 : item.productVariantPrices[0].price / 100;

        const name = item.name || item.translations[0].name || '';
        
        return {
            id,
            name,
            description: item.product?.description || '',
            price,
            image,
            points: Math.floor(price / pointValue),
            isInFavorite,
            isPaidWithPoints: false,
        }
    })
}