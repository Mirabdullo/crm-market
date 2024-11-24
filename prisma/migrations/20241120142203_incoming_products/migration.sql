-- CreateTable
CREATE TABLE "incoming_products" (
    "id" UUID NOT NULL DEFAULT GEN_RANDOM_UUID(),
    "product_id" UUID NOT NULL,
    "count" INTEGER NOT NULL,
    "cost" DECIMAL(10,3) NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL,
    "deleted_at" TIMESTAMP,

    CONSTRAINT "incoming_products_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "incoming_products" ADD CONSTRAINT "incoming_products_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
