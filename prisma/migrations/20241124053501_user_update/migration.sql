/*
  Warnings:

  - You are about to drop the column `password` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `users` table. All the data in the column will be lost.
  - Added the required column `type` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "UserTypeEnum" AS ENUM ('client', 'supplier');

-- AlterTable
ALTER TABLE "users" DROP COLUMN "password",
DROP COLUMN "role",
ADD COLUMN     "type" "UserTypeEnum" NOT NULL;

-- CreateTable
CREATE TABLE "order" (
    "id" UUID NOT NULL DEFAULT GEN_RANDOM_UUID(),
    "client_id" UUID NOT NULL,
    "sum" DECIMAL(10,3) NOT NULL,
    "debt" DECIMAL(10,3) NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL,
    "deleted_at" TIMESTAMP,

    CONSTRAINT "order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_products" (
    "id" UUID NOT NULL DEFAULT GEN_RANDOM_UUID(),
    "order_id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "price" DECIMAL(10,3) NOT NULL,
    "cost" DECIMAL(10,3) NOT NULL,
    "avarage_cost" DECIMAL(10,3) NOT NULL,
    "count" INTEGER NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL,
    "deleted_at" TIMESTAMP,

    CONSTRAINT "order_products_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "order" ADD CONSTRAINT "order_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "order_products" ADD CONSTRAINT "order_products_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "order"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "order_products" ADD CONSTRAINT "order_products_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
