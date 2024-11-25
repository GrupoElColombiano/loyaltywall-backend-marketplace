import { DeepPartial, ID, ProductVariant, VendureEntity, EntityId } from '@vendure/core';
import { Column, Entity, ManyToOne } from 'typeorm';

@Entity()
export class Favorite extends VendureEntity {
    constructor(input?: DeepPartial<Favorite>) {
        super(input);
    }

    @Column()
    userId: string;

    @ManyToOne(type => ProductVariant)
    productVariant: ProductVariant;

    @EntityId()
    productVariantId: ID;
}
