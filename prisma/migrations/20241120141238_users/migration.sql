-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT GEN_RANDOM_UUID(),
    "name" VARCHAR NOT NULL,
    "password" VARCHAR,
    "phone" VARCHAR NOT NULL,
    "role" VARCHAR NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL,
    "deleted_at" TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);
