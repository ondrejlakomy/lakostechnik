import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const drivers = [
  { firstName: "Jan", lastName: "Pastrniak", phone: "606638662", code: "1588", defaultSpz: "8M31588", note: "kontejner", role: "DRIVER" },
  { firstName: "Renáta", lastName: "Lančová", phone: "734394593", code: "6279", defaultSpz: "T026279", note: "Lespoint", role: "DRIVER" },
  { firstName: "Vojtěch", lastName: "Pastniak", phone: "733721929", code: "2174", defaultSpz: "3Z52174", note: "Kontejner", role: "DRIVER" },
  { firstName: "Jiří", lastName: "Chrastina", phone: "737295459", code: "3911", defaultSpz: null, note: "Štěpkovač 3, 5 – Štěpkař", role: "DRIVER" },
  { firstName: "Tomáš", lastName: "Hendrich", phone: "774517548", code: "7249", defaultSpz: "7M6 7249", note: "Kontejner (Klimex)", role: "DRIVER" },
  { firstName: "Jiří", lastName: "Valenta", phone: "730596743", code: "7644", defaultSpz: "9B7 7644", note: "Posuvka", role: "DRIVER" },
  { firstName: "Martin", lastName: "Zemánek", phone: "737886632", code: "2344", defaultSpz: "8T7 2344", note: "Posuvka", role: "DRIVER" },
  { firstName: "Martin", lastName: "Zemánek K", phone: "737886632", code: "7704", defaultSpz: "7J2 7704", note: "Kontejner", role: "DRIVER" },
  { firstName: "Bohumil", lastName: "Zeman", phone: "739370925", code: "4132", defaultSpz: "7M1 4132", note: "Man", role: "DRIVER" },
  { firstName: "Miloslav", lastName: "Sikora", phone: "608603487", code: "2093", defaultSpz: null, note: "MAN 6X4 – Štěpkař", role: "DRIVER" },
  { firstName: "Petr", lastName: "Navrátil", phone: "608278474", code: "1234", defaultSpz: null, note: "MAN 6X6 – Štěpkař", role: "DRIVER" },
  { firstName: "Tomáš", lastName: "Lakomý", phone: "737590117", code: "5044", defaultSpz: null, note: "BIG BOSS", role: "DRIVER" },
  { firstName: "Vladimír", lastName: "Sommer", phone: "605813333", code: "2581", defaultSpz: "5E5 2581", note: "Volvo 5E52581", role: "DRIVER" },
  { firstName: "Radovan", lastName: "Geppert", phone: "736435806", code: "4133", defaultSpz: "7M1 4132", note: "SCANIA", role: "DRIVER" },
  { firstName: "David", lastName: "Košár", phone: "722861733", code: "1511", defaultSpz: "5J6 5832", note: "", role: "DRIVER" },
];

async function main() {
  const password = await bcrypt.hash("1234", 12);

  for (const d of drivers) {
    // Vytvořit řidiče
    const driver = await prisma.driver.upsert({
      where: { code: d.code },
      update: {
        firstName: d.firstName,
        lastName: d.lastName,
        phone: d.phone,
        defaultSpz: d.defaultSpz,
        note: d.note || null,
      },
      create: {
        firstName: d.firstName,
        lastName: d.lastName,
        phone: d.phone,
        code: d.code,
        defaultSpz: d.defaultSpz,
        note: d.note || null,
        active: true,
      },
    });

    // Vytvořit uživatelský účet (email = jmeno.prijmeni@lakostechnik.cz)
    const emailBase = `${d.firstName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")}.${d.lastName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ /g, "")}`;
    const email = `${emailBase}@lakostechnik.cz`;

    await prisma.user.upsert({
      where: { email },
      update: { driverId: driver.id },
      create: {
        email,
        password,
        firstName: d.firstName,
        lastName: d.lastName,
        phone: d.phone,
        role: "DRIVER",
        driverId: driver.id,
        active: true,
      },
    });

    console.log(`  ${d.firstName} ${d.lastName} (${d.code}) → ${email}`);
  }

  console.log("\nHotovo! Všichni řidiči mají heslo: 1234");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
