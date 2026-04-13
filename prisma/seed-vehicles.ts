import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding vehicles...");

  const vehicles = [
    {
      name: "Scania R450",
      category: "NAKLADNI",
      brand: "Scania",
      model: "R450",
      yearOfManufacture: 2019,
      spz: "7M1 4132",
      color: "Bílá",
      odometerKm: 285000,
      transmission: "Automat",
      engine: "DC13, 450 HP",
      payload: 14000,
      grossWeight: 26000,
      tireSize: "315/80 R22.5",
      tireType: "CELOROCNI",
      tireCondition: 60,
      active: true,
      stkNextDate: new Date("2026-08-15"),
      oilNextKm: 300000,
      oilNextDate: new Date("2026-06-01"),
      lastServiceDate: new Date("2026-02-10"),
      lastServiceKm: 278000,
      nextServiceDate: new Date("2026-08-10"),
      nextServiceKm: 310000,
      note: "Hlavní tahač na štěpku",
    },
    {
      name: "MAN TGX 26.510",
      category: "NAKLADNI",
      brand: "MAN",
      model: "TGX 26.510",
      yearOfManufacture: 2021,
      spz: "5E5 2581",
      color: "Modrá",
      odometerKm: 142000,
      transmission: "Automat",
      engine: "D26, 510 HP",
      payload: 15000,
      grossWeight: 26000,
      tireSize: "315/80 R22.5",
      tireType: "CELOROCNI",
      tireCondition: 75,
      active: true,
      stkNextDate: new Date("2027-03-20"),
      oilNextKm: 160000,
      oilNextDate: new Date("2026-07-15"),
      lastServiceDate: new Date("2026-01-20"),
      lastServiceKm: 135000,
      nextServiceDate: new Date("2026-07-20"),
      nextServiceKm: 165000,
    },
    {
      name: "Volvo FH 500",
      category: "NAKLADNI",
      brand: "Volvo",
      model: "FH 500",
      yearOfManufacture: 2020,
      spz: "8T7 2344",
      color: "Zelená",
      odometerKm: 198000,
      transmission: "I-Shift",
      engine: "D13K, 500 HP",
      payload: 14500,
      grossWeight: 26000,
      tireSize: "315/80 R22.5",
      tireType: "CELOROCNI",
      tireCondition: 55,
      active: true,
      stkNextDate: new Date("2026-05-01"),
      oilNextKm: 210000,
      oilNextDate: new Date("2026-04-20"),
      lastServiceDate: new Date("2025-11-15"),
      lastServiceKm: 185000,
      note: "Blíží se STK!",
    },
    {
      name: "Škoda Octavia Combi",
      category: "OSOBNI",
      brand: "Škoda",
      model: "Octavia",
      variant: "Combi 2.0 TDI",
      yearOfManufacture: 2022,
      spz: "3Z5 2174",
      color: "Šedá",
      odometerKm: 67000,
      transmission: "DSG",
      engine: "2.0 TDI 150 HP",
      tireSize: "225/45 R17",
      tireType: "CELOROCNI",
      tireCondition: 70,
      active: true,
      stkNextDate: new Date("2026-11-10"),
      oilNextKm: 75000,
      oilNextDate: new Date("2026-09-01"),
      lastServiceDate: new Date("2026-03-01"),
      lastServiceKm: 65000,
      note: "Služební vůz",
    },
    {
      name: "Přívěs Schwarzmüller",
      category: "PRIPOJNE",
      brand: "Schwarzmüller",
      model: "3-nápravový",
      yearOfManufacture: 2018,
      spz: "T026279",
      odometerKm: 210000,
      grossWeight: 24000,
      payload: 18000,
      axleCount: 3,
      tireSize: "385/65 R22.5",
      tireType: "CELOROCNI",
      tireCondition: 45,
      active: true,
      stkNextDate: new Date("2026-04-25"),
      note: "STK za pár dní!",
    },
    {
      name: "Kontejnerový přívěs",
      category: "PRIPOJNE",
      brand: "Kögel",
      model: "Port 40",
      yearOfManufacture: 2017,
      spz: "7J2 7704",
      grossWeight: 36000,
      payload: 27000,
      axleCount: 3,
      tireSize: "385/65 R22.5",
      tireType: "CELOROCNI",
      tireCondition: 50,
      active: true,
      stkNextDate: new Date("2026-09-30"),
    },
    {
      name: "John Deere 6130R",
      category: "TRAKTOR",
      brand: "John Deere",
      model: "6130R",
      yearOfManufacture: 2020,
      spz: "TR-001",
      color: "Zelená",
      engineHours: 4200,
      engine: "4.5L PowerTech, 130 HP",
      grossWeight: 7500,
      tireSize: "540/65 R28",
      tireType: "PRACOVNI",
      tireCondition: 65,
      active: true,
      oilNextHours: 4500,
      oilNextDate: new Date("2026-06-01"),
      oilChangeHours: 4000,
      oilChangeDate: new Date("2026-01-15"),
      lastServiceDate: new Date("2026-01-15"),
      note: "Hlavní traktor",
    },
    {
      name: "CAT 950M",
      category: "NAKLADAC",
      brand: "Caterpillar",
      model: "950M",
      yearOfManufacture: 2019,
      color: "Žlutá",
      engineHours: 6800,
      engine: "C7.1 ACERT, 223 HP",
      operatingWeight: 18500,
      tireSize: "23.5 R25",
      tireType: "PRACOVNI",
      tireCondition: 40,
      active: true,
      oilNextHours: 7000,
      oilNextDate: new Date("2026-05-15"),
      oilChangeHours: 6500,
      oilChangeDate: new Date("2025-12-01"),
      lastServiceDate: new Date("2025-12-01"),
      note: "Blíží se výměna oleje",
    },
  ];

  for (const v of vehicles) {
    await prisma.vehicle.create({ data: v });
    console.log(`  ${v.name} (${v.spz || v.category})`);
  }

  // Přidat servisní záznamy
  const scania = await prisma.vehicle.findFirst({ where: { name: "Scania R450" } });
  if (scania) {
    await prisma.vehicleServiceRecord.createMany({
      data: [
        { vehicleId: scania.id, date: new Date("2026-02-10"), type: "OLEJ_FILTRY", description: "Výměna oleje + filtry", odometerKm: 278000, cost: 12500, supplier: "Scania servis Ústí" },
        { vehicleId: scania.id, date: new Date("2025-08-15"), type: "STK", description: "Pravidelná STK", odometerKm: 255000, cost: 2500 },
        { vehicleId: scania.id, date: new Date("2025-06-01"), type: "PNEUSERVIS", description: "Výměna předních pneumatik", odometerKm: 245000, cost: 28000, supplier: "Pneuservis Bílina" },
      ],
    });
  }

  // Přidat úkoly
  const volvo = await prisma.vehicle.findFirst({ where: { name: "Volvo FH 500" } });
  if (volvo) {
    await prisma.vehicleTask.createMany({
      data: [
        { vehicleId: volvo.id, title: "STK", priority: "URGENT", status: "OTEVRENY", dueDate: new Date("2026-05-01"), description: "Blíží se termín STK" },
        { vehicleId: volvo.id, title: "Výměna oleje + filtry", priority: "HIGH", status: "OTEVRENY", dueDateKm: 210000, description: "Při dalším servisu" },
        { vehicleId: volvo.id, title: "Oprava ochranné fólie", priority: "LOW", status: "OTEVRENY", description: "Poškozená fólie na pravém boku" },
      ],
    });
  }

  const cat = await prisma.vehicle.findFirst({ where: { name: "CAT 950M" } });
  if (cat) {
    await prisma.vehicleTask.createMany({
      data: [
        { vehicleId: cat.id, title: "Olej + filtry", priority: "HIGH", status: "OTEVRENY", dueDateHours: 7000, description: "Výměna při 7000 mth" },
        { vehicleId: cat.id, title: "Renovace přední kapoty", priority: "NORMAL", status: "V_RESENI", description: "Odřená kapota, domluveno s lakýrníkem" },
      ],
    });
  }

  const privs = await prisma.vehicle.findFirst({ where: { name: "Přívěs Schwarzmüller" } });
  if (privs) {
    await prisma.vehicleTask.createMany({
      data: [
        { vehicleId: privs.id, title: "STK", priority: "URGENT", status: "OTEVRENY", dueDate: new Date("2026-04-25"), description: "STK za pár dní!" },
        { vehicleId: privs.id, title: "Navařit vytržená oka", priority: "HIGH", status: "OTEVRENY", description: "Dvě vytržená oka na rámu" },
      ],
    });
  }

  console.log("\nVozidla a technika naplněna!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
