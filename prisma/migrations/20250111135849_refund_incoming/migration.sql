-- CreateTable
CREATE TABLE "refund_incoming" (
    "id" UUID NOT NULL DEFAULT GEN_RANDOM_UUID(),
    "supplier_id" UUID NOT NULL,
    "sum" DECIMAL(10,3) NOT NULL,
    "admin_id" UUID NOT NULL,
    "description" VARCHAR,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL,
    "deleted_at" TIMESTAMP,

    CONSTRAINT "refund_incoming_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refund_incoming_product" (
    "id" UUID NOT NULL DEFAULT GEN_RANDOM_UUID(),
    "order_id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "price" DECIMAL(10,3) NOT NULL,
    "count" INTEGER NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL,
    "deleted_at" TIMESTAMP,

    CONSTRAINT "refund_incoming_product_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "refund_incoming" ADD CONSTRAINT "refund_incoming_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "refund_incoming" ADD CONSTRAINT "refund_incoming_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "admins"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "refund_incoming_product" ADD CONSTRAINT "refund_incoming_product_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "refund_incoming"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "refund_incoming_product" ADD CONSTRAINT "refund_incoming_product_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
