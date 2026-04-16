import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Nastavit tachograf pro všechna nákladní vozidla
  const nakladni = await prisma.vehicle.findMany({
    where: { category: "NAKLADNI", active: true },
  });

  for (const v of nakladni) {
    // Poslední stažení tachografu: simulujeme různá data
    const lastDownload = new Date("2026-02-01");
    const nextDownload = new Date(lastDownload);
    nextDownload.setMonth(nextDownload.getMonth() + 3); // +3 měsíce

    // Revize tachografu
    const lastRevision = new Date("2025-04-01");
    const nextRevision = new Date(lastRevision);
    nextRevision.setMonth(nextRevision.getMonth() + 24); // +24 měsíců

    await prisma.vehicle.update({
      where: { id: v.id },
      data: {
        tachographDownloadDate: lastDownload,
        tachographDownloadNextDate: nextDownload,
        tachographRevisionDate: lastRevision,
        tachographRevisionNextDate: nextRevision,
      },
    });
    console.log(`  ${v.name}: stažení do ${nextDownload.toLocaleDateString("cs-CZ")}, revize do ${nextRevision.toLocaleDateString("cs-CZ")}`);
  }

  // Majkl - simulujeme prošlé stažení
  const majkl = await prisma.vehicle.findFirst({ where: { spz: "8M0 3406" } });
  if (majkl) {
    await prisma.vehicle.update({
      where: { id: majkl.id },
      data: {
        tachographDownloadDate: new Date("2025-12-15"),
        tachographDownloadNextDate: new Date("2026-03-15"), // prošlé!
      },
    });
    console.log("  Majkl: stažení PROŠLÉ (15.3.2026)");
  }

  console.log("\nTachografová data nastavena!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
