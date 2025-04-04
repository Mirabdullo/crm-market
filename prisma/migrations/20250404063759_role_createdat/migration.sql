-- AlterTable
ALTER TABLE "permissions" ADD COLUMN     "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deleted_at" TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP;

-- AlterTable
ALTER TABLE "roles" ADD COLUMN     "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deleted_at" TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP;
