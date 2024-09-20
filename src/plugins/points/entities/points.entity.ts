import { DeepPartial, ID, VendureEntity, EntityId } from '@vendure/core';
import { Column, Entity  } from 'typeorm';

@Entity()
export class Points extends VendureEntity {
    constructor(input?: DeepPartial<Points>) {
        super(input);
    }

    @Column()
    userId: string;

    @Column('name')
    name: string;

}
