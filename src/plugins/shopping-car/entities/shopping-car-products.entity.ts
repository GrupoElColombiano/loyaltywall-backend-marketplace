import { DeepPartial, ID, ProductVariant, VendureEntity, EntityId } from '@vendure/core';
import { Column, Entity, ManyToOne } from 'typeorm';

import { ShoppingCar } from './shopping-car.entity';

@Entity()
export class ShoppingCarProducts extends VendureEntity {
    constructor(input?: DeepPartial<ShoppingCarProducts>) {
        super(input);
    }

    @ManyToOne(type => ShoppingCar)
    shoppingCar: ShoppingCar;

    @EntityId()
    shoppingCarId: ID;

    @ManyToOne(type => ProductVariant)
    productVariant: ProductVariant;

    @EntityId()
    productVariantId: ID;

    @Column()
    quantity: number;

    @Column()
    isPaidWithPoints: boolean;
}