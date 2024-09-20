import {MigrationInterface, QueryRunner} from "typeorm";

export class shoppingCarFix1703704820657 implements MigrationInterface {

   public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "market_points"."shopping_car_products" DROP COLUMN "price"`, undefined);
        await queryRunner.query(`ALTER TABLE "market_points"."shopping_car_products" DROP COLUMN "points"`, undefined);
   }

   public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "market_points"."shopping_car_products" ADD "points" integer NOT NULL`, undefined);
        await queryRunner.query(`ALTER TABLE "market_points"."shopping_car_products" ADD "price" integer NOT NULL`, undefined);
   }

}
