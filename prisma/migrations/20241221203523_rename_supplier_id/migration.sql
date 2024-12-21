/*
  Warnings:

  - You are about to drop the column `client_id` on the `incoming_order_payment` table. All the data in the column will be lost.
  - Added the required column `supplier_id` to the `incoming_order_payment` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "incoming_order_payment" DROP CONSTRAINT "incoming_order_payment_client_id_fkey";

-- AlterTable
ALTER TABLE "incoming_order_payment" DROP COLUMN "client_id",
ADD COLUMN     "supplier_id" UUID NOT NULL;

-- AddForeignKey
ALTER TABLE "incoming_order_payment" ADD CONSTRAINT "incoming_order_payment_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
