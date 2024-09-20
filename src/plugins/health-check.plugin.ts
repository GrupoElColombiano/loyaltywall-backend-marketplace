import { PluginCommonModule, VendurePlugin } from '@vendure/core';
import { Request, Response, NextFunction } from 'express';
import { MiddlewareConsumer, NestModule } from '@nestjs/common';

@VendurePlugin({
    imports: [PluginCommonModule],
    providers: [],
})
export class HealthCheckPlugin implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply((req: Request, res: Response, next: NextFunction) => {
                if (req.path === '/') {
                    res.status(200).send('Healthy');
                } else {
                    next();
                }
            })
            .forRoutes('/');
    }
}
