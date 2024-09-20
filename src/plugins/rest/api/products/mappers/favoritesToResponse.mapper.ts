import { Favorite } from "src/plugins/favorites/entities/favorite.entity";

import { FavoriteResponse } from "../dtos";

export const favoritesToResponse = (items: Favorite[], pointValue:number): FavoriteResponse[] => {
    return items.map(item => {
        const id = Number(item.productVariant.id);

        const image =  item.productVariant.featuredAsset?.source || item.productVariant.product?.featuredAsset?.source || '';
        
        const price = item.productVariant.productVariantPrices[0].price / 100;
        
        return {
            id,
            name: item.productVariant.name || item.productVariant.translations[0].name || '',
            description: item.productVariant.product?.translations[0].description || '',
            price,
            image,
            points: Math.floor(price / pointValue),
            stock: item.productVariant.stockLevels[0].stockOnHand,
            isInFavorite: true,
            isPaidWithPoints: false,
        }
    })
}