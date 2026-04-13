import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Smazat staré testovací záznamy
  await prisma.vehicleTask.deleteMany({});
  await prisma.vehicleServiceRecord.deleteMany({});
  await prisma.vehicle.deleteMany({});
  console.log("Staré záznamy smazány.\n");

  // ======================== OSOBNÍ VOZY ========================
  const osobni = [
    {
      name: "Polaris Ranger Diesel TP30",
      category: "OSOBNI", brand: "Polaris", model: "Ranger Diesel TP30",
      active: true,
    },
    {
      name: "Opel Corsa Van",
      category: "OSOBNI", brand: "Opel", model: "Corsa Van",
      yearOfManufacture: 2009, spz: "8B7 3172", vin: "W0L0SDL0894336254",
      color: "Bílá", odometerKm: 395000, purchasePrice: 45000,
      transmission: "Manuál", engine: "1.3 CDI 16V/55kW",
      operatingWeight: 1205, grossWeight: 460,
      tireSize: "195/60 R15 88 T", tireType: "ZIMNI", tireCondition: 100,
      stkNextDate: new Date("2027-10-01"),
      note: "Olej ?",
    },
    {
      name: "Škoda Fabia",
      category: "OSOBNI", brand: "Škoda", model: "Fabia",
      yearOfManufacture: 2006, spz: "3M5 5889", vin: "TMBPK26Y264552151",
      color: "Žlutá", purchasePrice: 50000,
      transmission: "Manuál", engine: "1.4 TDI/59kW/BNV",
      operatingWeight: 1205, grossWeight: 440,
      tireSize: "165/70 R14 81 T", tireType: "ZIMNI", tireCondition: 100,
      stkNextDate: new Date("2027-06-01"),
      oilChangeDate: new Date("2025-06-01"), oilNextDate: new Date("2025-06-01"),
      note: "Koupit poklice",
    },
    {
      name: "Škoda Karoq Scout",
      category: "OSOBNI", brand: "Škoda", model: "Karoq Scout",
      yearOfManufacture: 2020, spz: "7M0 2580", vin: "TMBLM9NUXL2045893",
      color: "Šedá", odometerKm: 40000, purchasePrice: 610000,
      transmission: "DSG", engine: "2.0TDI/140kW/DFH",
      operatingWeight: 1610, grossWeight: 2100,
      tireSize: "225/50 R18 95 W", tireType: "ZIMNI", tireCondition: 100,
      stkNextDate: new Date("2026-06-01"),
      oilChangeDate: new Date("2025-06-01"), oilNextDate: new Date("2025-06-01"),
      grossWeight: 648,
      note: "Výměna kabinového filtru, Detailing před svátky?",
    },
    {
      name: "Škoda Octavia Scout",
      category: "OSOBNI", brand: "Škoda", model: "Octavia Scout",
      yearOfManufacture: 2014, spz: "5M6 2235", vin: "TMBLK7NE5F0068937",
      color: "Stříbrná", odometerKm: 255000, purchasePrice: 220000,
      transmission: "DSG", engine: "2.0 TDI/135kW/CUNA",
      operatingWeight: 1559, grossWeight: 570,
      tireSize: "225/50 R17 94 V", tireType: "ZIMNI", tireCondition: 80,
      stkNextDate: new Date("2026-10-01"),
      oilChangeDate: new Date("2025-09-01"), oilNextDate: new Date("2025-09-01"),
      note: "MOTOR!",
    },
    {
      name: "Škoda Kodiaq SportLine",
      category: "OSOBNI", brand: "Škoda", model: "Kodiaq SportLine",
      yearOfManufacture: 2023, spz: "7M8 2815", vin: "TMBLN7NS5P8042239",
      color: "Červená", odometerKm: 25000, purchasePrice: 900000,
      transmission: "DSG", engine: "2.0 TDI/147kW/DTU",
      operatingWeight: 1767, grossWeight: 2500,
      tireSize: "235/50 R19 99 V", tireType: "ZIMNI", tireCondition: 80,
      stkNextDate: new Date("2027-06-01"),
      oilNextDate: new Date("2024-10-01"),
      grossWeight: 643,
    },
    {
      name: "Mitsubishi Pajero",
      category: "OSOBNI", brand: "Mitsubishi", model: "Pajero",
      yearOfManufacture: 2006, spz: "3M3 6207", vin: "JMBMYV68W5J000233",
      color: "Stříbrná", odometerKm: 280000, purchasePrice: 110000,
      transmission: "Automat", engine: "3.2 DI-D/118kW/4M41",
      operatingWeight: 2015, grossWeight: 2800,
      tireSize: "275/70 R16 112 S", tireType: "ZIMNI", tireCondition: 80,
      stkNextDate: new Date("2027-10-01"),
      oilChangeDate: new Date("2025-06-01"), oilNextDate: new Date("2025-06-01"),
      grossWeight: 495,
    },
    {
      name: "Land Rover Defender",
      category: "OSOBNI", brand: "Land Rover", model: "Defender",
      yearOfManufacture: 2023, spz: "7M6 9452", vin: "SALEA7BW8P2214383",
      color: "Tmavě šedá", odometerKm: 24000,
      transmission: "Automat", engine: "3.0/221kW/DT306",
      operatingWeight: 2520, grossWeight: 3500,
      tireSize: "255/65 R19 114 H", tireType: "CELOROCNI", tireCondition: 70,
      stkNextDate: new Date("2027-06-01"),
      oilChangeDate: new Date("2025-06-03"), oilNextDate: new Date("2025-06-03"),
      grossWeight: 680,
      note: "Oprava ochranné folie (levé zadní kolo)",
    },
    {
      name: "VW Caddy (oranžový)",
      category: "OSOBNI", brand: "Volkswagen", model: "Caddy",
      yearOfManufacture: 2008, spz: "5M9 5802", vin: "WV1ZZZ2KZ9X038588",
      color: "Oranžová", odometerKm: 380000, purchasePrice: 85000,
      transmission: "Manuál", engine: "2.0 TDI/77kW",
      operatingWeight: 1481, grossWeight: 754,
      tireSize: "195/65 R15 95 T", tireType: "ZIMNI", tireCondition: 100,
      stkNextDate: new Date("2027-10-01"),
      oilNextDate: new Date("2026-04-13"), // červená = Olej!
      note: "Olej + filtry, Padá nafta, EOBD, Kryt tažného oka",
    },
    {
      name: "VW Caddy (stříbrný)",
      category: "OSOBNI", brand: "Volkswagen", model: "Caddy",
      yearOfManufacture: 2013, spz: "7M6 8035", vin: "WV2ZZZ2KZEX001092",
      color: "Stříbrná", odometerKm: 289000, purchasePrice: 120000,
      transmission: "Manuál", engine: "1.6 TDI/75kW/CAY",
      operatingWeight: 1474, grossWeight: 790,
      tireSize: "195/65 R15 91 T", tireType: "ZIMNI", tireCondition: 80,
      stkNextDate: new Date("2027-10-01"),
      oilChangeDate: new Date("2025-09-01"), oilNextDate: new Date("2025-09-01"),
      note: "Nový nárazník, Sedadlo řidiče",
    },
    {
      name: "VW Transporter",
      category: "OSOBNI", brand: "Volkswagen", model: "Transporter",
      yearOfManufacture: 2012, spz: "4M6 2647", vin: "WV1ZZZ7HZCH136916",
      color: "LC9A Prue White", odometerKm: 298000,
      transmission: "Manuál", engine: "2.0 TDI/75kW",
      operatingWeight: 1762, grossWeight: 2200,
      tireSize: "205/65 R16C 107 T", tireType: "ZIMNI", tireCondition: 100,
      stkNextDate: new Date("2026-09-01"),
      oilChangeDate: new Date("2025-01-31"), oilNextDate: new Date("2025-01-31"),
      grossWeight: 1038,
    },
    {
      name: "VW Caravelle 4MOTION",
      category: "OSOBNI", brand: "Volkswagen", model: "Caravelle 4MOTION",
      yearOfManufacture: 2023, spz: "6M4 7409", vin: "WV2ZZZ7HZRH015760",
      color: "Šedá + zelená folie", odometerKm: 30000,
      transmission: "DSG", engine: "2.0 TDI/110kW 4Motion",
      operatingWeight: 1375, grossWeight: 2220,
      tireSize: "215/60 R17C 109 H", tireType: "ZIMNI", tireCondition: 45,
      stkNextDate: new Date("2027-10-01"),
      grossWeight: 638,
      note: "Soláry, Olej (km) ?",
    },
    {
      name: "VW Grand California",
      category: "OSOBNI", brand: "Volkswagen", model: "Grand California",
      yearOfManufacture: 2021, spz: "6L2 3405", vin: "WV1ZZZSYZM9041858",
      color: "Bílá + šedá", odometerKm: 70000,
      transmission: "DSG", engine: "2.0 TDI/130kW",
      operatingWeight: 2996, grossWeight: 2000,
      tireSize: "235/65 R16C 115 R", tireType: "CELOROCNI", tireCondition: 85,
      stkNextDate: new Date("2027-04-01"),
      grossWeight: 504,
      note: "Klimatizace, Navrhnou design",
    },
  ];

  for (const v of osobni) {
    await prisma.vehicle.create({ data: v as any });
    console.log(`  [OSOBNÍ] ${v.name} (${v.spz || "–"})`);
  }

  // ======================== NÁKLADNÍ ========================
  const nakladni = [
    {
      name: "MAN TGX 35.560 (kontejnerka)",
      category: "NAKLADNI", brand: "MAN", model: "TGX 35.560",
      nickname: "Kontejnerka",
      yearOfManufacture: 2014, spz: "8M0 3564", vin: "WMA92XZZ8FL070996",
      color: "Červená", odometerKm: 219000,
      transmission: "Automat", engine: "15,3/412kW/D3876 LF01",
      payload: 14110, grossWeight: 43360,
      tireSize: "385/65 R22.5 160K / 11.75 X 22.5, 315/80 R22.5 154/150 K (2Y 9.00 X 22.5)",
      active: true,
      stkNextDate: new Date("2028-03-01"),
      note: "Olej (km) ?, hlavní kontejnerka",
      operatingWeight: 35000,
    },
    {
      name: "MAN TGS 18.440 4x4 (Majkl)",
      category: "NAKLADNI", brand: "MAN", model: "TGS 18.440 4x4",
      nickname: "Majkl",
      yearOfManufacture: 2012, spz: "8M0 3406", vin: "WMA80SZZ5DM613023",
      color: "Červená", odometerKm: 656000,
      transmission: "Automat", engine: "10,5/324kW/D2066LF40",
      payload: 8075, grossWeight: 26400,
      tireSize: "13R22,5 156/K / 22.5 X 9.00",
      active: true,
      stkNextDate: new Date("2026-02-01"),
      note: "Olej (km) ?, STK prošlá!",
    },
    {
      name: "MAN TGS 33.540 6x6 Jenz Hem 583 (Peťa)",
      category: "NAKLADNI", brand: "MAN", model: "TGS 33.540 6x6",
      nickname: "Peťa",
      yearOfManufacture: 2014, spz: "T02 4701", vin: "WMA56SZZ9EM643547",
      color: "Zelená",
      transmission: "Manuál", engine: "12.4/397kW/D2676 LF06",
      payload: 24500,
      tireSize: "315/80 R22.5 149 G + 385/65 R22.5 160K",
      active: true,
      note: "Jenz Hem 583, Olej (km) ?",
    },
    {
      name: "MAN TGS 28.540 6x4 Jenz Hem 583 (Milda)",
      category: "NAKLADNI", brand: "MAN", model: "TGS 28.540 6x4",
      nickname: "Milda",
      yearOfManufacture: 2014, spz: "T02 4693", vin: "WMA84SZZ2EL068751",
      color: "Zelená",
      transmission: "Manuál", engine: "12,4/397kW/D2676 LF06",
      payload: 25300,
      tireSize: "315/80 R22.5 149 G + 385/65 R22.5 160K",
      active: true,
      note: "Jenz Hem 583, Olej (km) ?",
    },
    {
      name: "MAN TGX 18.540 4x2 (Boban)",
      category: "NAKLADNI", brand: "MAN", model: "TGX 18.540 4x2",
      nickname: "Boban",
      yearOfManufacture: 2017, spz: "7M1 4132", vin: "WMA06XZZXHP081779",
      color: "Bílá",
      transmission: "Automat", engine: "12,4/324kW/D2676 LF46",
      payload: 8116, grossWeight: 44000,
      tireSize: "315/70R22.5 156 (150 - dvojmontáž) L",
      active: true,
      stkNextDate: new Date("2026-04-29"),
      note: "Olej (km) ?",
    },
    {
      name: "MAN TGX 18.540 4x2 (Gepas)",
      category: "NAKLADNI", brand: "MAN", model: "TGX 18.540 4x2",
      nickname: "Gepas",
      yearOfManufacture: 2025, spz: "8M0 3558",
      color: "Bílá",
      transmission: "Automat",
      grossWeight: 44000,
      tireSize: "315/70R22.5 156 (150 - dvojmontáž) L",
      active: true,
      stkNextDate: new Date("2026-06-01"),
      note: "Olej (km) ?",
    },
  ];

  for (const v of nakladni) {
    await prisma.vehicle.create({ data: v as any });
    console.log(`  [NÁKLADNÍ] ${v.name} (${v.spz || "–"})`);
  }

  // ======================== TRAKTORY ========================
  const traktory = [
    {
      name: "FENDT 210 Vario (333)",
      category: "TRAKTOR", brand: "Fendt", model: "210 Vario",
      nickname: "333",
      yearOfManufacture: 2013, spz: "M00 9963", vin: "333211970",
      color: "Zelená - základní",
      transmission: "Vario", engine: "3.3/77kW/33CTA",
      operatingWeight: 4150, grossWeight: 10975,
      tireSize: "320/70 R24 114 A8 (p) + 420/85 R30 140 A8 (z)",
      tireType: "PRACOVNI",
      active: true,
      stkNextDate: new Date("2027-08-01"),
      note: "Olej",
    },
    {
      name: "FENDT 820 Vario (731)",
      category: "TRAKTOR", brand: "Fendt", model: "820 Vario",
      nickname: "731",
      yearOfManufacture: 2008, spz: "M00 9945", vin: "731215013",
      color: "Zelená - základní",
      transmission: "Vario", engine: "6.1/152kW/TCD2012L064V",
      operatingWeight: 6775, grossWeight: 24600,
      tireSize: "540/65 R30 143 A8 (p) + 580/70 R42 158 A8 (z)",
      tireType: "PRACOVNI",
      active: true,
      stkNextDate: new Date("2025-09-01"),
      oilChangeDate: new Date("2026-03-01"), oilNextDate: new Date("2026-03-01"),
      note: "STK prošlá!, Renovace přední kapoty",
    },
    {
      name: "FENDT 933 Vario (944)",
      category: "TRAKTOR", brand: "Fendt", model: "933 Vario",
      nickname: "944",
      yearOfManufacture: 2014, spz: "M01 3521", vin: "944211326",
      color: "Zelená - základní",
      engineHours: 6000,
      transmission: "Vario", engine: "7.8/238kW/TCD7.8L6",
      operatingWeight: 9790, grossWeight: 28500,
      tireSize: "600/65 R34 60 D (p) + 710/70 R42 176 D (z)",
      tireType: "PRACOVNI",
      active: true,
      stkNextDate: new Date("2026-11-01"),
      note: "Oleje + filtry, Zadní pneu",
    },
  ];

  for (const v of traktory) {
    await prisma.vehicle.create({ data: v as any });
    console.log(`  [TRAKTOR] ${v.name} (${v.spz || "–"})`);
  }

  // ======================== NAKLADAČE ========================
  const nakladace = [
    {
      name: "JCB 536-70",
      category: "NAKLADAC", brand: "JCB", model: "536-70",
      yearOfManufacture: 2018, spz: "Z06 0019", vin: "JCB5XR4JJJ2728990",
      color: "Žlutá",
      engine: "4,8/108kW/448 TA4-108",
      operatingWeight: 8470,
      tireSize: "460/70 R24",
      tireType: "PRACOVNI",
      active: true,
      note: "Vilémov",
    },
    {
      name: "JCB 550-80",
      category: "NAKLADAC", brand: "JCB", model: "550-80",
      yearOfManufacture: 2014, spz: "M013522", vin: "JCB5UWVHT02084081",
      color: "Žlutá",
      engine: "4,4/108 kW/JCB TCAE - 108",
      operatingWeight: 10195,
      tireSize: "440/80 R26",
      tireType: "PRACOVNI",
      active: true,
    },
    {
      name: "JCB 560-80",
      category: "NAKLADAC", brand: "JCB", model: "560-80",
      yearOfManufacture: 2019, spz: "M01 2631", vin: "JCB5YY4WCJ2782576",
      color: "Žlutá",
      engine: "4,8/108kW/448 TA4-108",
      operatingWeight: 12110,
      tireSize: "480/80 R26",
      tireType: "PRACOVNI",
      active: true,
      stkNextDate: new Date("2027-04-01"),
      note: "Vilémov",
    },
  ];

  for (const v of nakladace) {
    await prisma.vehicle.create({ data: v as any });
    console.log(`  [NAKLADAČ] ${v.name} (${v.spz || "–"})`);
  }

  // ======================== PŘÍPOJNÁ (už existují, přeskočíme) ========================
  // Kögel a Knapen byly přidány dříve, znovu je vytvoříme protože jsme vše smazali
  const pripojne = [
    {
      name: "KÖGEL YWE 18 P",
      category: "PRIPOJNE", brand: "Kögel", model: "YWE 18 P",
      yearOfManufacture: 1999, spz: "T02 4683", vin: "WK0YWE018X0139244",
      color: "Červená",
      grossWeight: 26800, payload: 4600,
      tireSize: "235/75 R17.5",
      active: true,
      stkNextDate: new Date("2026-04-09"),
      note: "Základní provedení",
    },
    {
      name: "KNAPEN K100 (Posuvka Boban)",
      category: "PRIPOJNE", brand: "Knapen", model: "K100",
      nickname: "Posuvka Boban",
      yearOfManufacture: 2022, spz: "7M3 5463", vin: "XPNK0C1000ND082363",
      color: "Bílá",
      grossWeight: 45000, operatingWeight: 8230,
      tireSize: "385/65 R22.5 160",
      active: true,
      stkNextDate: new Date("2026-07-10"),
      note: "O4",
    },
  ];

  for (const v of pripojne) {
    await prisma.vehicle.create({ data: v as any });
    console.log(`  [PŘÍPOJNÉ] ${v.name} (${v.spz || "–"})`);
  }

  // ======================== ÚKOLY ========================
  console.log("\nPřidávám úkoly...");

  const kogelNew = await prisma.vehicle.findFirst({ where: { spz: "T02 4683" } });
  if (kogelNew) {
    await prisma.vehicleTask.createMany({
      data: [
        { vehicleId: kogelNew.id, title: "Navařit vytržená oka", priority: "HIGH", status: "OTEVRENY" },
        { vehicleId: kogelNew.id, title: "Horní kryt", priority: "NORMAL", status: "OTEVRENY" },
        { vehicleId: kogelNew.id, title: "Dodělat desky", priority: "NORMAL", status: "OTEVRENY" },
        { vehicleId: kogelNew.id, title: "STK", priority: "URGENT", status: "OTEVRENY", dueDate: new Date("2026-04-09") },
      ],
    });
  }

  const caddy1 = await prisma.vehicle.findFirst({ where: { spz: "5M9 5802" } });
  if (caddy1) {
    await prisma.vehicleTask.createMany({
      data: [
        { vehicleId: caddy1.id, title: "Olej + filtry", priority: "URGENT", status: "OTEVRENY" },
        { vehicleId: caddy1.id, title: "Padá nafta", priority: "HIGH", status: "OTEVRENY" },
        { vehicleId: caddy1.id, title: "EOBD", priority: "NORMAL", status: "OTEVRENY" },
        { vehicleId: caddy1.id, title: "Kryt tažného oka", priority: "LOW", status: "OTEVRENY" },
      ],
    });
  }

  const caddy2 = await prisma.vehicle.findFirst({ where: { spz: "7M6 8035" } });
  if (caddy2) {
    await prisma.vehicleTask.createMany({
      data: [
        { vehicleId: caddy2.id, title: "Nový nárazník", priority: "NORMAL", status: "OTEVRENY" },
        { vehicleId: caddy2.id, title: "Sedadlo řidiče", priority: "NORMAL", status: "OTEVRENY" },
      ],
    });
  }

  const defender = await prisma.vehicle.findFirst({ where: { spz: "7M6 9452" } });
  if (defender) {
    await prisma.vehicleTask.create({
      data: { vehicleId: defender.id, title: "Oprava ochranné folie (levé zadní kolo)", priority: "NORMAL", status: "OTEVRENY" },
    });
  }

  const caravelle = await prisma.vehicle.findFirst({ where: { spz: "6M4 7409" } });
  if (caravelle) {
    await prisma.vehicleTask.create({
      data: { vehicleId: caravelle.id, title: "Soláry", priority: "NORMAL", status: "OTEVRENY" },
    });
  }

  const grandCali = await prisma.vehicle.findFirst({ where: { spz: "6L2 3405" } });
  if (grandCali) {
    await prisma.vehicleTask.createMany({
      data: [
        { vehicleId: grandCali.id, title: "Klimatizace", priority: "NORMAL", status: "OTEVRENY" },
        { vehicleId: grandCali.id, title: "Navrhnout design", priority: "LOW", status: "OTEVRENY" },
      ],
    });
  }

  const fendt820 = await prisma.vehicle.findFirst({ where: { spz: "M00 9945" } });
  if (fendt820) {
    await prisma.vehicleTask.createMany({
      data: [
        { vehicleId: fendt820.id, title: "STK", priority: "URGENT", status: "OTEVRENY", description: "STK prošlá!" },
        { vehicleId: fendt820.id, title: "Renovace přední kapoty", priority: "NORMAL", status: "OTEVRENY" },
      ],
    });
  }

  const fendt933 = await prisma.vehicle.findFirst({ where: { spz: "M01 3521" } });
  if (fendt933) {
    await prisma.vehicleTask.createMany({
      data: [
        { vehicleId: fendt933.id, title: "Oleje + filtry", priority: "HIGH", status: "OTEVRENY" },
        { vehicleId: fendt933.id, title: "Zadní pneu", priority: "NORMAL", status: "OTEVRENY" },
      ],
    });
  }

  const karoq = await prisma.vehicle.findFirst({ where: { spz: "7M0 2580" } });
  if (karoq) {
    await prisma.vehicleTask.createMany({
      data: [
        { vehicleId: karoq.id, title: "Výměna kabinového filtru", priority: "NORMAL", status: "OTEVRENY" },
        { vehicleId: karoq.id, title: "Detailing před svátky?", priority: "LOW", status: "OTEVRENY" },
      ],
    });
  }

  const octavia = await prisma.vehicle.findFirst({ where: { spz: "5M6 2235" } });
  if (octavia) {
    await prisma.vehicleTask.create({
      data: { vehicleId: octavia.id, title: "MOTOR!", priority: "URGENT", status: "OTEVRENY" },
    });
  }

  const majkl = await prisma.vehicle.findFirst({ where: { spz: "8M0 3406" } });
  if (majkl) {
    await prisma.vehicleTask.create({
      data: { vehicleId: majkl.id, title: "STK", priority: "URGENT", status: "OTEVRENY", description: "STK prošlá (2.2026)!" },
    });
  }

  const boban = await prisma.vehicle.findFirst({ where: { spz: "7M1 4132" } });
  if (boban) {
    await prisma.vehicleTask.create({
      data: { vehicleId: boban.id, title: "STK", priority: "URGENT", status: "OTEVRENY", dueDate: new Date("2026-04-29"), description: "STK 29.04.2026" },
    });
  }

  console.log("\nVšechna reálná vozidla nahrána!");
  console.log("Celkem: 14 osobních, 6 nákladních, 3 traktory, 3 nakladače, 2 přípojná = 28 vozidel");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
