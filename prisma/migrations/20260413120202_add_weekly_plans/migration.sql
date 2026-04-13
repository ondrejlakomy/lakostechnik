-- CreateTable
CREATE TABLE "power_plant_weekly_plans" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "power_plant_id" TEXT NOT NULL,
    "week_start" DATETIME NOT NULL,
    "target_prm" REAL NOT NULL,
    "note" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "power_plant_weekly_plans_power_plant_id_fkey" FOREIGN KEY ("power_plant_id") REFERENCES "power_plants" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_warehouses" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'SKLAD',
    "location_id" TEXT,
    "address" TEXT,
    "current_stock" REAL NOT NULL DEFAULT 0,
    "unit" TEXT NOT NULL DEFAULT 'PRM',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "note" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "warehouses_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "locations" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_warehouses" ("active", "address", "code", "created_at", "current_stock", "id", "location_id", "name", "note", "type", "unit", "updated_at") SELECT "active", "address", "code", "created_at", "current_stock", "id", "location_id", "name", "note", "type", "unit", "updated_at" FROM "warehouses";
DROP TABLE "warehouses";
ALTER TABLE "new_warehouses" RENAME TO "warehouses";
CREATE UNIQUE INDEX "warehouses_code_key" ON "warehouses"("code");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "power_plant_weekly_plans_power_plant_id_week_start_key" ON "power_plant_weekly_plans"("power_plant_id", "week_start");
