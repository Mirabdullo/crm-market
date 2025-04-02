-- CreateTable
CREATE TABLE "employee_payment" (
    "id" UUID NOT NULL DEFAULT GEN_RANDOM_UUID(),
    "sum" DECIMAL(10,3) NOT NULL,
    "employee_id" UUID NOT NULL,
    "description" VARCHAR,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL,
    "deleted_at" TIMESTAMP,

    CONSTRAINT "employee_payment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "employee_payment" ADD CONSTRAINT "employee_payment_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "admins"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
