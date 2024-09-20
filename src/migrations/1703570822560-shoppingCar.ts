import {MigrationInterface, QueryRunner} from "typeorm";

export class shoppingCar1703570822560 implements MigrationInterface {

   public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE TABLE "market_points"."shopping_car_products" ("createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "quantity" integer NOT NULL, "price" integer NOT NULL, "points" integer NOT NULL, "isPaidWithPoints" boolean NOT NULL, "id" SERIAL NOT NULL, "shoppingCarId" integer NOT NULL, "productVariantId" integer NOT NULL, CONSTRAINT "PK_3b731d31545d8567829a029a52b" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`CREATE TABLE "market_points"."shopping_car" ("createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" character varying NOT NULL, "isActivated" boolean NOT NULL, "id" SERIAL NOT NULL, CONSTRAINT "PK_53109209604a8d9fe4238ea03b1" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`ALTER TABLE "market_points"."shopping_car_products" ADD CONSTRAINT "FK_a594220b017670c5025dddf8f16" FOREIGN KEY ("shoppingCarId") REFERENCES "market_points"."shopping_car"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "market_points"."shopping_car_products" ADD CONSTRAINT "FK_e879faf516bd07664640d9dbfd5" FOREIGN KEY ("productVariantId") REFERENCES "market_points"."product_variant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
   }

   public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "market_points"."shopping_car_products" DROP CONSTRAINT "FK_e879faf516bd07664640d9dbfd5"`, undefined);
        await queryRunner.query(`ALTER TABLE "market_points"."shopping_car_products" DROP CONSTRAINT "FK_a594220b017670c5025dddf8f16"`, undefined);
        await queryRunner.query(`DROP TABLE "market_points"."shopping_car"`, undefined);
        await queryRunner.query(`DROP TABLE "market_points"."shopping_car_products"`, undefined);
   }

}
