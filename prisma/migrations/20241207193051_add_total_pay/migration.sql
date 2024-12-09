-- AlterTable
ALTER TABLE "incoming_order_payment" ADD COLUMN     "debt" DECIMAL(10,3) DEFAULT 0,
ADD COLUMN     "total_pay" DECIMAL(10,3) DEFAULT 0;

-- AlterTable
ALTER TABLE "payment" ADD COLUMN     "debt" DECIMAL(10,3) DEFAULT 0,
ADD COLUMN     "total_pay" DECIMAL(10,3) DEFAULT 0;
