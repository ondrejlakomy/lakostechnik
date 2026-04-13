-- CreateTable
CREATE TABLE "vehicles" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "brand" TEXT,
    "model" TEXT,
    "variant" TEXT,
    "nickname" TEXT,
    "year_of_manufacture" INTEGER,
    "date_of_purchase" TIMESTAMP(3),
    "purchase_price" DOUBLE PRECISION,
    "current_value" DOUBLE PRECISION,
    "spz" TEXT,
    "vin" TEXT,
    "color" TEXT,
    "odometer_km" DOUBLE PRECISION,
    "engine_hours" DOUBLE PRECISION,
    "transmission" TEXT,
    "engine" TEXT,
    "payload" DOUBLE PRECISION,
    "gross_weight" DOUBLE PRECISION,
    "operating_weight" DOUBLE PRECISION,
    "tire_size" TEXT,
    "tire_type" TEXT,
    "tire_condition" INTEGER,
    "axle_count" INTEGER,
    "assigned_driver_id" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "note" TEXT,
    "stk_date" TIMESTAMP(3),
    "stk_next_date" TIMESTAMP(3),
    "oil_change_date" TIMESTAMP(3),
    "oil_change_km" DOUBLE PRECISION,
    "oil_change_hours" DOUBLE PRECISION,
    "oil_next_km" DOUBLE PRECISION,
    "oil_next_date" TIMESTAMP(3),
    "oil_next_hours" DOUBLE PRECISION,
    "filter_change_date" TIMESTAMP(3),
    "filter_next_date" TIMESTAMP(3),
    "last_service_date" TIMESTAMP(3),
    "last_service_km" DOUBLE PRECISION,
    "next_service_date" TIMESTAMP(3),
    "next_service_km" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vehicles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicle_service_records" (
    "id" TEXT NOT NULL,
    "vehicle_id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "odometer_km" DOUBLE PRECISION,
    "engine_hours" DOUBLE PRECISION,
    "cost" DOUBLE PRECISION,
    "supplier" TEXT,
    "note" TEXT,
    "created_by_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vehicle_service_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicle_tasks" (
    "id" TEXT NOT NULL,
    "vehicle_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT,
    "priority" TEXT NOT NULL DEFAULT 'NORMAL',
    "status" TEXT NOT NULL DEFAULT 'OTEVRENY',
    "due_date" TIMESTAMP(3),
    "due_date_km" DOUBLE PRECISION,
    "due_date_hours" DOUBLE PRECISION,
    "description" TEXT,
    "internal_note" TEXT,
    "assigned_person" TEXT,
    "completed_at" TIMESTAMP(3),
    "created_by_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vehicle_tasks_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_assigned_driver_id_fkey" FOREIGN KEY ("assigned_driver_id") REFERENCES "drivers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_service_records" ADD CONSTRAINT "vehicle_service_records_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_service_records" ADD CONSTRAINT "vehicle_service_records_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_tasks" ADD CONSTRAINT "vehicle_tasks_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_tasks" ADD CONSTRAINT "vehicle_tasks_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
