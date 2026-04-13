import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Přidávám reálná vozidla...\n");

  // PŘÍPOJNÁ VOZIDLA
  const kogel = await prisma.vehicle.create({
    data: {
      name: "KÖGEL YWE 18 P",
      category: "PRIPOJNE",
      brand: "Kögel",
      model: "YWE 18 P",
      yearOfManufacture: 1999,
      spz: "T02 4683",
      vin: "WK0YWE018X0139244",
      color: "Červená",
      grossWeight: 26800,
      payload: 4600,
      tireSize: "235/75 R17.5",
      tireType: "CELOROCNI",
      active: true,
      stkNextDate: new Date("2026-04-09"),
      note: "Základní provedení",
    },
  });
  console.log("  KÖGEL YWE 18 P (T02 4683)");

  // Úkoly pro Kögel
  await prisma.vehicleTask.createMany({
    data: [
      { vehicleId: kogel.id, title: "Navařit vytržená oka", priority: "HIGH", status: "OTEVRENY" },
      { vehicleId: kogel.id, title: "Horní kryt", priority: "NORMAL", status: "OTEVRENY" },
      { vehicleId: kogel.id, title: "Dodělat desky", priority: "NORMAL", status: "OTEVRENY" },
      { vehicleId: kogel.id, title: "STK", priority: "URGENT", status: "OTEVRENY", dueDate: new Date("2026-04-09"), description: "STK vypršela!" },
    ],
  });

  const knapen = await prisma.vehicle.create({
    data: {
      name: "KNAPEN K100 (Posuvka Boban)",
      category: "PRIPOJNE",
      brand: "Knapen",
      model: "K100",
      nickname: "Posuvka Boban",
      yearOfManufacture: 2022,
      spz: "7M3 5463",
      vin: "XPNK0C1000ND082363",
      color: "Bílá",
      grossWeight: 45000,
      operatingWeight: 8230,
      tireSize: "385/65 R22.5 160",
      tireType: "CELOROCNI",
      active: true,
      stkNextDate: new Date("2026-07-10"),
      note: "O4",
    },
  });
  console.log("  KNAPEN K100 Posuvka Boban (7M3 5463)");

  console.log("\nHotovo! Pošli další screenshoty pro doplnění dalších vozidel.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
