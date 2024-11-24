-- CreateTable
CREATE TABLE "admins" (
    "id" UUID NOT NULL DEFAULT GEN_RANDOM_UUID(),
    "name" VARCHAR NOT NULL,
    "phone" VARCHAR NOT NULL,
    "password" VARCHAR NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL,
    "deleted_at" TIMESTAMP,

    CONSTRAINT "admins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" UUID NOT NULL DEFAULT GEN_RANDOM_UUID(),
    "name" VARCHAR NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permissions" (
    "id" UUID NOT NULL DEFAULT GEN_RANDOM_UUID(),
    "name" VARCHAR NOT NULL,
    "role_id" UUID NOT NULL,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_AdminsToPermissions" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_AdminsToPermissions_AB_unique" ON "_AdminsToPermissions"("A", "B");

-- CreateIndex
CREATE INDEX "_AdminsToPermissions_B_index" ON "_AdminsToPermissions"("B");

-- AddForeignKey
ALTER TABLE "permissions" ADD CONSTRAINT "permissions_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "_AdminsToPermissions" ADD CONSTRAINT "_AdminsToPermissions_A_fkey" FOREIGN KEY ("A") REFERENCES "admins"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AdminsToPermissions" ADD CONSTRAINT "_AdminsToPermissions_B_fkey" FOREIGN KEY ("B") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
