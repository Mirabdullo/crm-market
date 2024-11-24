-- CreateTable
CREATE TABLE "products" (
    "id" UUID NOT NULL DEFAULT GEN_RANDOM_UUID(),
    "name" VARCHAR NOT NULL,
    "count" INTEGER NOT NULL,
    "unit" VARCHAR NOT NULL,
    "min_amount" INTEGER NOT NULL,
    "cost" DECIMAL(10,3) NOT NULL,
    "avarage_cost" DECIMAL(20,12) NOT NULL,
    "selling_price" DECIMAL(10,3) NOT NULL,
    "wholesale_price" DECIMAL(10,3) NOT NULL,
    "role" VARCHAR NOT NULL,
    "category" VARCHAR NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL,
    "deleted_at" TIMESTAMP,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);
