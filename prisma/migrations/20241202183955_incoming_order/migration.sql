/*
  Warnings:

  - Added the required column `order_id` to the `incoming_products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `selling_price` to the `incoming_products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `wholesale_price` to the `incoming_products` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "incoming_products" ADD COLUMN     "order_id" UUID NOT NULL,
ADD COLUMN     "selling_price" DECIMAL(10,3) NOT NULL,
ADD COLUMN     "wholesale_price" DECIMAL(10,3) NOT NULL;

-- CreateTable
CREATE TABLE "incoming_order" (
    "id" UUID NOT NULL DEFAULT GEN_RANDOM_UUID(),
    "client_id" UUID NOT NULL,
    "sum" DECIMAL(10,3) NOT NULL,
    "debt" DECIMAL(10,3) NOT NULL DEFAULT 0,
    "accepted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL,
    "deleted_at" TIMESTAMP,

    CONSTRAINT "incoming_order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "incoming_order_payment" (
    "id" UUID NOT NULL DEFAULT GEN_RANDOM_UUID(),
    "order_id" UUID NOT NULL,
    "client_id" UUID NOT NULL,
    "cost" DECIMAL(10,3) DEFAULT 0,
    "avarage_cost" DECIMAL(10,3) DEFAULT 0,
    "selling_price" DECIMAL(10,3) DEFAULT 0,
    "wholesale_price" DECIMAL(10,3) DEFAULT 0,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL,
    "deleted_at" TIMESTAMP,

    CONSTRAINT "incoming_order_payment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "incoming_order" ADD CONSTRAINT "incoming_order_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "incoming_products" ADD CONSTRAINT "incoming_products_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "incoming_order"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "incoming_order_payment" ADD CONSTRAINT "incoming_order_payment_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "incoming_order"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "incoming_order_payment" ADD CONSTRAINT "incoming_order_payment_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
