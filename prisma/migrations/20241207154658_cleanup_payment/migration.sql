/*
  Warnings:

  - You are about to drop the column `avarage_cost` on the `incoming_order_payment` table. All the data in the column will be lost.
  - You are about to drop the column `cost` on the `incoming_order_payment` table. All the data in the column will be lost.
  - You are about to drop the column `selling_price` on the `incoming_order_payment` table. All the data in the column will be lost.
  - You are about to drop the column `wholesale_price` on the `incoming_order_payment` table. All the data in the column will be lost.
  - You are about to drop the column `avarage_cost` on the `payment` table. All the data in the column will be lost.
  - You are about to drop the column `cost` on the `payment` table. All the data in the column will be lost.
  - You are about to drop the column `selling_price` on the `payment` table. All the data in the column will be lost.
  - You are about to drop the column `wholesale_price` on the `payment` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "incoming_order_payment" DROP COLUMN "avarage_cost",
DROP COLUMN "cost",
DROP COLUMN "selling_price",
DROP COLUMN "wholesale_price",
ADD COLUMN     "card" DECIMAL(10,3) DEFAULT 0,
ADD COLUMN     "cash" DECIMAL(10,3) DEFAULT 0,
ADD COLUMN     "humo" DECIMAL(10,3) DEFAULT 0,
ADD COLUMN     "other" DECIMAL(10,3) DEFAULT 0,
ADD COLUMN     "transfer" DECIMAL(10,3) DEFAULT 0;

-- AlterTable
ALTER TABLE "payment" DROP COLUMN "avarage_cost",
DROP COLUMN "cost",
DROP COLUMN "selling_price",
DROP COLUMN "wholesale_price",
ADD COLUMN     "card" DECIMAL(10,3) DEFAULT 0,
ADD COLUMN     "cash" DECIMAL(10,3) DEFAULT 0,
ADD COLUMN     "other" DECIMAL(10,3) DEFAULT 0,
ADD COLUMN     "transfer" DECIMAL(10,3) DEFAULT 0;
