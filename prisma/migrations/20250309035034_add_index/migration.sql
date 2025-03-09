-- CreateIndex
CREATE INDEX "order_id_articl_idx" ON "order"("id", "articl");

-- CreateIndex
CREATE INDEX "products_id_name_idx" ON "products"("id", "name");

-- CreateIndex
CREATE INDEX "users_id_name_idx" ON "users"("id", "name");
