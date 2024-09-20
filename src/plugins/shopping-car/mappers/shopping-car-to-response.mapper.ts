import { ShoppingCar } from '../entities/shopping-car.entity';
import { IShoppingCar } from '../dtos';

export function shoppingCarToResponseMapper(shoppingCar: ShoppingCar, pointValue: number): IShoppingCar {
    const { id, isActivated, userId, shoppingCarProducts } = shoppingCar;

    const products = shoppingCarProducts.map((shoppingCarProduct) => {
        const id = Number(shoppingCarProduct.productVariant.id);

        const price = Number(shoppingCarProduct.productVariant.productVariantPrices[0].price) / 100;

        const points = Math.floor(price / pointValue);

        const quantity = Number(shoppingCarProduct.quantity);

        const name = shoppingCarProduct.productVariant?.product?.translations[0].name ?? '';

        const description = shoppingCarProduct.productVariant.product?.translations[0].description ?? '';

        const image = shoppingCarProduct.productVariant?.product?.featuredAsset?.source ?? '';

        const isPaidWithPoints = shoppingCarProduct.isPaidWithPoints;

        return {
            id,
            price,
            points,
            quantity,
            name,
            description,
            image,
            isPaidWithPoints,
        };
    });

    return {
        id: Number(id),
        isActive: isActivated,
        userId,
        products,
    };
}