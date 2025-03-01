-- AddForeignKey
ALTER TABLE "payment" ADD CONSTRAINT "payment_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "admins"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
