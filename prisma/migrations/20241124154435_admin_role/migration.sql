-- CreateEnum
CREATE TYPE "AdminRoleEnum" AS ENUM ('admin', 'super_admin');

-- AlterTable
ALTER TABLE "admins" ADD COLUMN     "role" "AdminRoleEnum" NOT NULL DEFAULT 'admin';
