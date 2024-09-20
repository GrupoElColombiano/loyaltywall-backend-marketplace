import {MigrationInterface, QueryRunner} from "typeorm";

export class favorites1702485781193 implements MigrationInterface {

   public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE TABLE "market_points"."favorite" ("createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" character varying NOT NULL, "id" SERIAL NOT NULL, "productVariantId" integer NOT NULL, CONSTRAINT "PK_495675cec4fb09666704e4f610f" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`ALTER TABLE "market_points"."favorite" ADD CONSTRAINT "FK_f8550fd7a4462812fd15f6a3386" FOREIGN KEY ("productVariantId") REFERENCES "market_points"."product_variant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
   }

   public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "market_points"."favorite" DROP CONSTRAINT "FK_f8550fd7a4462812fd15f6a3386"`, undefined);
        await queryRunner.query(`DROP TABLE "market_points"."favorite"`, undefined);
   }

}
