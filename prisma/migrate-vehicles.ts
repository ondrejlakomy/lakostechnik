import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // 1. Převést stávající defaultSpz do tabulky vozidel
  const drivers = await prisma.driver.findMany();
  for (const d of drivers) {
    if (d.defaultSpz) {
      const existing = await prisma.driverVehicle.findFirst({
        where: { driverId: d.id, spz: d.defaultSpz },
      });
      if (!existing) {
        await prisma.driverVehicle.create({
          data: { driverId: d.id, spz: d.defaultSpz, name: d.note || null },
        });
        console.log(`  Vozidlo ${d.defaultSpz} → ${d.firstName} ${d.lastName}`);
      }
    }
  }

  // 2. Sloučit duplicitního Martina Zemánka (kód 7704) do původního (kód 2344)
  const zemanek2344 = await prisma.driver.findUnique({ where: { code: "2344" } });
  const zemanek7704 = await prisma.driver.findUnique({ where: { code: "7704" } });

  if (zemanek2344 && zemanek7704) {
    // Přesunout vozidlo 7J2 7704 k původnímu Zemánkovi
    const hasVehicle = await prisma.driverVehicle.findFirst({
      where: { driverId: zemanek2344.id, spz: "7J2 7704" },
    });
    if (!hasVehicle) {
      await prisma.driverVehicle.create({
        data: { driverId: zemanek2344.id, spz: "7J2 7704", name: "Kontejner" },
      });
    }

    // Opravit jméno (odstranit " K")
    await prisma.driver.update({
      where: { code: "2344" },
      data: { note: "Posuvka, Kontejner" },
    });

    // Přesunout přepravy z duplikátu
    await prisma.transport.updateMany({
      where: { driverId: zemanek7704.id },
      data: { driverId: zemanek2344.id },
    });

    // Smazat duplicitní uživatelský účet
    await prisma.user.deleteMany({ where: { driverId: zemanek7704.id } });

    // Smazat duplicitní vozidla
    await prisma.driverVehicle.deleteMany({ where: { driverId: zemanek7704.id } });

    // Smazat duplikát řidiče
    await prisma.driver.delete({ where: { code: "7704" } });

    console.log("\n  Martin Zemánek sloučen – 2 vozidla pod kódem 2344");
  }

  // Aktualizovat jména vozidel ze stávajících poznámek
  const vehicleNames: Record<string, string> = {
    "8M31588": "Kontejner",
    "T026279": "Lespoint",
    "3Z52174": "Kontejner",
    "7M6 7249": "Kontejner (Klimex)",
    "9B7 7644": "Posuvka",
    "8T7 2344": "Posuvka",
    "7M1 4132": "Man",
    "5E5 2581": "Volvo",
    "5J6 5832": "",
  };

  for (const [spz, name] of Object.entries(vehicleNames)) {
    if (name) {
      await prisma.driverVehicle.updateMany({
        where: { spz },
        data: { name },
      });
    }
  }

  console.log("\nHotovo!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
