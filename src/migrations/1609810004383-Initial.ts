import {MigrationInterface, QueryRunner} from "typeorm";

export class Initial1609810004383 implements MigrationInterface {
    name = 'Initial1609810004383'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "message" ("id" SERIAL NOT NULL, "dId" character varying NOT NULL, "type" character varying NOT NULL, "channel" character varying NOT NULL, "guild" character varying NOT NULL, CONSTRAINT "PK_ba01f0a3e0123651915008bc578" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "role" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "dId" character varying NOT NULL, "emoji" character varying NOT NULL, "guild" character varying NOT NULL, CONSTRAINT "PK_b36bcfe02fc8de3c57a8b2391c2" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "role"`);
        await queryRunner.query(`DROP TABLE "message"`);
    }

}
