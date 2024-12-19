/*
  Warnings:

  - You are about to drop the column `avarage_cost` on the `order_products` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "incoming_order_payment" ALTER COLUMN "order_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "order_products" DROP COLUMN "avarage_cost";

-- AlterTable
ALTER TABLE "payment" ALTER COLUMN "order_id" DROP NOT NULL;
