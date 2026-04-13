import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Admin
  const adminPassword = await bcrypt.hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@lakostechnik.cz" },
    update: {},
    create: {
      email: "admin@lakostechnik.cz",
      password: adminPassword,
      firstName: "Admin",
      lastName: "LAKOSTECHNIK",
      phone: "+420 600 000 001",
      role: "ADMIN",
    },
  });

  // Řidiči
  const driver1 = await prisma.driver.create({
    data: { firstName: "Jan", lastName: "Novák", phone: "+420 601 111 111", code: "NOV", defaultSpz: "1AB 2345", active: true },
  });
  const driver2 = await prisma.driver.create({
    data: { firstName: "Petr", lastName: "Dvořák", phone: "+420 601 222 222", code: "DVO", defaultSpz: "2CD 6789", active: true },
  });
  const driver3 = await prisma.driver.create({
    data: { firstName: "Martin", lastName: "Svoboda", phone: "+420 601 333 333", code: "SVO", defaultSpz: "3EF 1234", active: true },
  });

  // Uživatelské účty pro řidiče
  const driverPassword = await bcrypt.hash("ridic123", 12);
  await prisma.user.create({
    data: { email: "novak@lakostechnik.cz", password: driverPassword, firstName: "Jan", lastName: "Novák", role: "DRIVER", driverId: driver1.id },
  });
  await prisma.user.create({
    data: { email: "dvorak@lakostechnik.cz", password: driverPassword, firstName: "Petr", lastName: "Dvořák", role: "DRIVER", driverId: driver2.id },
  });

  // Uživatel L1
  const userPassword = await bcrypt.hash("user123", 12);
  await prisma.user.create({
    data: { email: "provoz@lakostechnik.cz", password: userPassword, firstName: "Karel", lastName: "Provozní", role: "USER_L1" },
  });

  // Lokace
  const lok1 = await prisma.location.create({ data: { name: "Les Bílina", code: "BIL", address: "Bílina, okres Teplice", active: true } });
  const lok2 = await prisma.location.create({ data: { name: "Les Chomutov", code: "CHO", address: "Chomutov", active: true } });
  const lok3 = await prisma.location.create({ data: { name: "Les Kadaň", code: "KAD", address: "Kadaň, okres Chomutov", active: true } });

  // Sklady
  const skl1 = await prisma.warehouse.create({
    data: { name: "Mezisklad Bílina", code: "MSK-BIL", type: "MEZISKLAD", locationId: lok1.id, currentStock: 480, unit: "PRM", active: true },
  });
  const skl2 = await prisma.warehouse.create({
    data: { name: "Sklad Chomutov", code: "SKL-CHO", type: "SKLAD", locationId: lok2.id, currentStock: 1020, unit: "PRM", active: true },
  });
  const skl3 = await prisma.warehouse.create({
    data: { name: "Mezisklad Kadaň", code: "MSK-KAD", type: "MEZISKLAD", locationId: lok3.id, currentStock: 260, unit: "PRM", active: true },
  });

  // Odběratelé
  const odb1 = await prisma.customer.create({ data: { name: "Energo CZ s.r.o.", ico: "12345678", address: "Praha 1", contactPerson: "Ing. Tomáš Energetik", phone: "+420 700 100 200", active: true } });
  const odb2 = await prisma.customer.create({ data: { name: "BioTeplo a.s.", ico: "87654321", address: "Ústí nad Labem", contactPerson: "Mgr. Jana Teplá", phone: "+420 700 300 400", active: true } });

  // Elektrárny
  const el1 = await prisma.powerPlant.create({ data: { name: "Elektrárna Ledvice", address: "Ledvice, okres Teplice", contactPerson: "Ing. Pavel Elektrický", phone: "+420 800 100 100", active: true } });
  const el2 = await prisma.powerPlant.create({ data: { name: "Teplárna Komořany", address: "Komořany, Most", contactPerson: "Ing. Eva Tepelná", phone: "+420 800 200 200", active: true } });

  // Štěpkovače
  const chip1 = await prisma.chipper.create({ data: { name: "Jenz HEM 583", internalCode: "STP-01", active: true } });
  const chip2 = await prisma.chipper.create({ data: { name: "Pezzolato PTH 900", internalCode: "STP-02", active: true } });

  // Turnusy závozu
  const shift1 = await prisma.deliveryShift.create({
    data: { name: "Turnus 2026/04 - Ledvice", dateFrom: new Date("2026-04-01"), dateTo: new Date("2026-04-30"), active: true },
  });
  const shift2 = await prisma.deliveryShift.create({
    data: { name: "Turnus 2026/04 - Komořany", dateFrom: new Date("2026-04-01"), dateTo: new Date("2026-04-30"), active: true },
  });

  // Testovací přepravy
  const transports = [
    {
      number: "BIL-NOV-0001-2026",
      status: "POTVRZENO" as const,
      deliveryShiftId: shift1.id,
      deliveryNoteNumber: "DL-001",
      weighingTicketNumber: "VL-001",
      loadingPlace: "Les Bílina",
      unloadingPlace: "Elektrárna Ledvice",
      originLocationId: lok1.id,
      sourceWarehouseId: skl1.id,
      powerPlantId: el1.id,
      customerId: odb1.id,
      chipperName: "František Štěpkař",
      chipperId: chip1.id,
      driverId: driver1.id,
      vehicleSpz: "1AB 2345",
      kilometers: 42.5,
      nettoWeight: 24.8,
      prm: 80.0,
      createdById: admin.id,
      updatedById: admin.id,
    },
    {
      number: "CHO-DVO-0001-2026",
      status: "POTVRZENO" as const,
      deliveryShiftId: shift2.id,
      deliveryNoteNumber: "DL-002",
      weighingTicketNumber: "VL-002",
      loadingPlace: "Les Chomutov",
      unloadingPlace: "Teplárna Komořany",
      originLocationId: lok2.id,
      sourceWarehouseId: skl2.id,
      powerPlantId: el2.id,
      customerId: odb2.id,
      chipperName: "Jaroslav Drtič",
      chipperId: chip2.id,
      driverId: driver2.id,
      vehicleSpz: "2CD 6789",
      kilometers: 35.0,
      nettoWeight: 22.1,
      prm: 72.0,
      createdById: admin.id,
      updatedById: admin.id,
    },
    {
      number: "KAD-SVO-0001-2026",
      status: "KONCEPT" as const,
      deliveryShiftId: shift1.id,
      loadingPlace: "Les Kadaň",
      unloadingPlace: "Elektrárna Ledvice",
      originLocationId: lok3.id,
      sourceWarehouseId: skl3.id,
      powerPlantId: el1.id,
      customerId: odb1.id,
      driverId: driver3.id,
      vehicleSpz: "3EF 1234",
      kilometers: 55.0,
      nettoWeight: 26.3,
      prm: 85.0,
      createdById: admin.id,
      updatedById: admin.id,
    },
  ];

  for (const t of transports) {
    await prisma.transport.create({ data: t });
  }

  // Číselné řady
  await prisma.numberSequence.create({ data: { prefix: "BIL-NOV", year: 2026, lastNumber: 1 } });
  await prisma.numberSequence.create({ data: { prefix: "CHO-DVO", year: 2026, lastNumber: 1 } });
  await prisma.numberSequence.create({ data: { prefix: "KAD-SVO", year: 2026, lastNumber: 1 } });

  console.log("Seed complete!");
  console.log("\nTestovací účty:");
  console.log("  Admin:  admin@lakostechnik.cz / admin123");
  console.log("  Provoz: provoz@lakostechnik.cz / user123");
  console.log("  Řidič:  novak@lakostechnik.cz / ridic123");
  console.log("  Řidič:  dvorak@lakostechnik.cz / ridic123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
