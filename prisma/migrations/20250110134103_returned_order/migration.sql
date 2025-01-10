-- CreateTable
CREATE TABLE "returned_order" (
    "id" UUID NOT NULL DEFAULT GEN_RANDOM_UUID(),
    "client_id" UUID NOT NULL,
    "sum" DECIMAL(10,3) NOT NULL,
    "from_client" DECIMAL(10,3) DEFAULT 0,
    "cash_payment" DECIMAL(10,3) DEFAULT 0,
    "admin_id" UUID NOT NULL,
    "accepted" BOOLEAN NOT NULL DEFAULT false,
    "description" VARCHAR,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL,
    "deleted_at" TIMESTAMP,

    CONSTRAINT "returned_order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "returned_products" (
    "id" UUID NOT NULL DEFAULT GEN_RANDOM_UUID(),
    "order_id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "price" DECIMAL(10,3) NOT NULL,
    "count" INTEGER NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL,
    "deleted_at" TIMESTAMP,

    CONSTRAINT "returned_products_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "returned_order" ADD CONSTRAINT "returned_order_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "returned_order" ADD CONSTRAINT "returned_order_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "admins"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "returned_products" ADD CONSTRAINT "returned_products_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "returned_order"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "returned_products" ADD CONSTRAINT "returned_products_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
