import {
    dummyPaymentHandler,
    DefaultJobQueuePlugin,
    DefaultSearchPlugin,
    VendureConfig,
    DefaultAssetNamingStrategy,
} from '@vendure/core';
import { defaultEmailHandlers, EmailPlugin } from '@vendure/email-plugin';
import { AssetServerPlugin, configureS3AssetStorage } from '@vendure/asset-server-plugin';
import { AdminUiPlugin } from '@vendure/admin-ui-plugin';
import 'dotenv/config';
import path from 'path';
import { RestPlugin } from './plugins/rest/rest.plugin';
import { FavoritesPlugin } from './plugins/favorites/favorites.plugin';
import { ShoppingCarPlugin } from './plugins/shopping-car/shopping-car.plugin';
import { fromEnv } from '@aws-sdk/credential-providers';
import { HealthCheckPlugin } from './plugins/health-check.plugin';

const IS_DEV = process.env.APP_ENV === 'dev';

export const config: VendureConfig = {
    apiOptions: {
        port: 80,
        adminApiPath: 'admin-api',
        shopApiPath: 'shop-api',
        // The following options are useful in development mode,
        // but are best turned off for production for security
        // reasons.
        ...(IS_DEV ? {
            adminApiPlayground: {
                settings: { 'request.credentials': 'include' },
            },
            adminApiDebug: true,
            shopApiPlayground: {
                settings: { 'request.credentials': 'include' },
            },
            shopApiDebug: true,
        } : {}),
    },
    authOptions: {
        tokenMethod: ['bearer', 'cookie'],
        superadminCredentials: {
            identifier: process.env.SUPERADMIN_USERNAME,
            password: process.env.SUPERADMIN_PASSWORD,
        },
        cookieOptions: {
          secret: process.env.COOKIE_SECRET,
        },
    },
    dbConnectionOptions: {
        type: 'postgres',
        // See the README.md "Migrations" section for an explanation of
        // the `synchronize` and `migrations` options.
        synchronize: false,
        migrations: [path.join(__dirname, './migrations/*.+(js|ts)')],
        logging: false,
        database: process.env.DB_NAME,
        schema: process.env.DB_SCHEMA,
        host: process.env.DB_HOST,
        port: +process.env.DB_PORT,
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
    },
    paymentOptions: {
        paymentMethodHandlers: [dummyPaymentHandler],
    },
    // When adding or altering custom field definitions, the database will
    // need to be updated. See the "Migrations" section in README.md.
    customFields: {},
    plugins: [
        RestPlugin,
        FavoritesPlugin,
        ShoppingCarPlugin,
        AssetServerPlugin.init({
            route: 'assets',
            assetUploadDir: path.join(__dirname, 'assets'),
            namingStrategy: new DefaultAssetNamingStrategy(),
            storageStrategyFactory: configureS3AssetStorage({
                bucket: 'vendure-s3-230071806171',
                credentials: fromEnv(), // or any other credential provider
                nativeS3Configuration: {
                  region: process.env.AWS_REGION,
                },
            }),
        }),
        // AssetServerPlugin.init({
        //     route: 'assets',
        //     assetUploadDir: path.join(__dirname, '../static/assets'),
        //     // For local dev, the correct value for assetUrlPrefix should
        //     // be guessed correctly, but for production it will usually need
        //     // to be set manually to match your production url.
        //     assetUrlPrefix: IS_DEV ? undefined : 'https://www.my-shop.com/assets',
        // }),
        DefaultJobQueuePlugin.init({ useDatabaseForBuffer: true }),
        DefaultSearchPlugin.init({ bufferUpdates: false, indexStockStatus: true }),
        EmailPlugin.init({
            devMode: true,
            outputPath: path.join(__dirname, '../static/email/test-emails'),
            route: 'mailbox',
            handlers: defaultEmailHandlers,
            templatePath: path.join(__dirname, '../static/email/templates'),
            globalTemplateVars: {
                // The following variables will change depending on your storefront implementation.
                // Here we are assuming a storefront running at http://localhost:8080.
                fromAddress: '"example" <noreply@example.com>',
                verifyEmailAddressUrl: 'http://localhost:8080/verify',
                passwordResetUrl: 'http://localhost:8080/password-reset',
                changeEmailAddressUrl: 'http://localhost:8080/verify-email-address-change'
            },
        }),
        AdminUiPlugin.init({
            route: 'admin',
            port: 443,
            // // port: 80,
            // adminUiConfig: {
            //     apiPort: 443,
            // },
        }),
        HealthCheckPlugin,
    ],
};
