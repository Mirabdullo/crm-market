-- AlterTable
ALTER TABLE "permissions" ADD COLUMN     "key" VARCHAR NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "roles" ADD COLUMN     "key" VARCHAR NOT NULL DEFAULT '';
