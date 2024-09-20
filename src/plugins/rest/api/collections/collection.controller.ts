// Collection Controller
// --------------------
// This file contains the controller for the collection endpoint. It is responsible for
// handling incoming requests and returning data to the client. The controller is
// registered in the `RestPlugin` file.
// --------------------
import { Controller, Get } from '@nestjs/common';
import { Ctx, CollectionService, RequestContext } from '@vendure/core';

// resources
// import { FavoritesService } from '../../../favorites/services/favorites.service';

@Controller('collections')
export class CollectionsController {
    constructor(private collectionService: CollectionService) {
    }

    @Get()
    async findAll(@Ctx() ctx: RequestContext) {
        const collections = await this.collectionService.findAll(ctx);
        
        return collections;
    }
}