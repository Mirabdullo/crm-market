-- AlterTable
ALTER TABLE "incoming_order" ADD COLUMN     "selling_date" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "order" ADD COLUMN     "selling_date" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;