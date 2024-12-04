/*
  Warnings:

  - Added the required column `admin_id` to the `incoming_order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `admin_id` to the `order` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "incoming_order" ADD COLUMN     "admin_id" UUID NOT NULL;

-- AlterTable
ALTER TABLE "order" ADD COLUMN     "admin_id" UUID NOT NULL;

-- AddForeignKey
ALTER TABLE "incoming_order" ADD CONSTRAINT "incoming_order_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "admins"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "order" ADD CONSTRAINT "order_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "admins"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
