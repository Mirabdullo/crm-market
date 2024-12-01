-- AlterTable
ALTER TABLE "order" ALTER COLUMN "debt" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "payment" ALTER COLUMN "cost" SET DEFAULT 0,
ALTER COLUMN "avarage_cost" SET DEFAULT 0,
ALTER COLUMN "selling_price" SET DEFAULT 0,
ALTER COLUMN "wholesale_price" SET DEFAULT 0;
