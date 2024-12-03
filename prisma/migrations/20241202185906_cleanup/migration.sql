/*
  Warnings:

  - You are about to drop the column `client_id` on the `incoming_order` table. All the data in the column will be lost.
  - You are about to drop the column `order_id` on the `incoming_products` table. All the data in the column will be lost.
  - Added the required column `supplier_id` to the `incoming_order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `incoming_order_id` to the `incoming_products` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "incoming_order" DROP CONSTRAINT "incoming_order_client_id_fkey";

-- DropForeignKey
ALTER TABLE "incoming_products" DROP CONSTRAINT "incoming_products_order_id_fkey";

-- AlterTable
ALTER TABLE "incoming_order" DROP COLUMN "client_id",
ADD COLUMN     "supplier_id" UUID NOT NULL;

-- AlterTable
ALTER TABLE "incoming_products" DROP COLUMN "order_id",
ADD COLUMN     "incoming_order_id" UUID NOT NULL,
ALTER COLUMN "selling_price" DROP NOT NULL,
ALTER COLUMN "wholesale_price" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "incoming_order" ADD CONSTRAINT "incoming_order_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "incoming_products" ADD CONSTRAINT "incoming_products_incoming_order_id_fkey" FOREIGN KEY ("incoming_order_id") REFERENCES "incoming_order"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
