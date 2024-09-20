import { DeepPartial, ID, ProductVariant, VendureEntity, EntityId } from '@vendure/core';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { ShoppingCarProducts } from './shopping-car-products.entity';

@Entity()
export class ShoppingCar extends VendureEntity {
    constructor(input?: DeepPartial<ShoppingCar>) {
        super(input);
    }

    @Column()
    userId: string;

    @OneToMany(type => ShoppingCarProducts, shoppingCarProducts => shoppingCarProducts.shoppingCar)
    shoppingCarProducts: ShoppingCarProducts[];

    @Column()
    isActivated: boolean;
}