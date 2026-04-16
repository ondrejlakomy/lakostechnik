import { prisma } from "@/lib/prisma";
import { requirePermission, jsonResponse } from "@/lib/api-helpers";

export async function GET() {
  const { error } = await requirePermission("manage_locations");
  if (error) return error;

  const now = new Date();
  const in30Days = new Date();
  in30Days.setDate(in30Days.getDate() + 30);

  // Total counts
  const [totalVehicles, activeVehicles, inactiveVehicles] = await Promise.all([
    prisma.vehicle.count(),
    prisma.vehicle.count({ where: { active: true } }),
    prisma.vehicle.count({ where: { active: false } }),
  ]);

  // Count by category
  const categories = ["OSOBNI", "NAKLADNI", "PRIPOJNE", "TRAKTOR", "NAKLADAC"] as const;
  const byCategoryResults = await Promise.all(
    categories.map(async (cat) => ({
      category: cat,
      count: await prisma.vehicle.count({ where: { category: cat, active: true } }),
    }))
  );
  const byCategory = Object.fromEntries(
    byCategoryResults.map((r) => [r.category, r.count])
  );

  // STK stats
  const [stkExpired, stkSoon] = await Promise.all([
    prisma.vehicle.count({
      where: {
        active: true,
        stkNextDate: { lt: now },
      },
    }),
    prisma.vehicle.count({
      where: {
        active: true,
        stkNextDate: { gte: now, lte: in30Days },
      },
    }),
  ]);

  // Task stats
  const [openTasks, urgentTasks] = await Promise.all([
    prisma.vehicleTask.count({
      where: {
        status: { in: ["OTEVRENY", "V_RESENI"] },
      },
    }),
    prisma.vehicleTask.count({
      where: {
        priority: "URGENT",
        status: { notIn: ["HOTOVO", "ZRUSENO"] },
      },
    }),
  ]);

  // Upcoming deadlines - vehicles with nearest dates
  const vehiclesWithDates = await prisma.vehicle.findMany({
    where: {
      active: true,
      OR: [
        { stkNextDate: { not: null } },
        { oilNextDate: { not: null } },
        { nextServiceDate: { not: null } },
        { tachographDownloadNextDate: { not: null } },
        { tachographRevisionNextDate: { not: null } },
      ],
    },
    select: {
      id: true,
      name: true,
      spz: true,
      category: true,
      stkNextDate: true,
      oilNextDate: true,
      nextServiceDate: true,
      tachographDownloadNextDate: true,
      tachographRevisionNextDate: true,
    },
  });

  // Find the nearest deadline for each vehicle
  const upcomingDeadlines = vehiclesWithDates
    .map((v) => {
      const dates = [
        v.stkNextDate ? { type: "STK", date: v.stkNextDate } : null,
        v.oilNextDate ? { type: "Výměna oleje", date: v.oilNextDate } : null,
        v.nextServiceDate ? { type: "Servis", date: v.nextServiceDate } : null,
        v.tachographDownloadNextDate ? { type: "Stažení tachografu", date: v.tachographDownloadNextDate } : null,
        v.tachographRevisionNextDate ? { type: "Revize tachografu", date: v.tachographRevisionNextDate } : null,
      ].filter(Boolean) as { type: string; date: Date }[];

      if (dates.length === 0) return null;

      const nearest = dates.sort((a, b) => a.date.getTime() - b.date.getTime())[0];

      return {
        vehicleId: v.id,
        vehicleName: v.name,
        spz: v.spz,
        category: v.category,
        deadlineType: nearest.type,
        deadlineDate: nearest.date,
      };
    })
    .filter(Boolean)
    .sort((a, b) => new Date(a!.deadlineDate).getTime() - new Date(b!.deadlineDate).getTime())
    .slice(0, 10);

  // Vozidla s akutní STK (prošlá nebo do 30 dní)
  const stkAlertVehicles = await prisma.vehicle.findMany({
    where: {
      active: true,
      stkNextDate: { not: null, lte: in30Days },
    },
    select: { id: true, name: true, spz: true, category: true, stkNextDate: true },
    orderBy: { stkNextDate: "asc" },
  });

  // Vozidla s akutním olejem (prošlá nebo do 30 dní)
  const oilAlertVehicles = await prisma.vehicle.findMany({
    where: {
      active: true,
      oilNextDate: { not: null, lte: in30Days },
    },
    select: { id: true, name: true, spz: true, category: true, oilNextDate: true, oilNextKm: true, oilNextHours: true },
    orderBy: { oilNextDate: "asc" },
  });

  // Tachograf - stažení (3 měsíce) - prošlé nebo do 30 dní
  const tachDownloadAlertVehicles = await prisma.vehicle.findMany({
    where: {
      active: true,
      tachographDownloadNextDate: { not: null, lte: in30Days },
    },
    select: { id: true, name: true, spz: true, category: true, tachographDownloadNextDate: true, tachographDownloadDate: true },
    orderBy: { tachographDownloadNextDate: "asc" },
  });

  // Tachograf - revize (24 měsíců) - prošlé nebo do 60 dní
  const in60Days = new Date();
  in60Days.setDate(in60Days.getDate() + 60);
  const tachRevisionAlertVehicles = await prisma.vehicle.findMany({
    where: {
      active: true,
      tachographRevisionNextDate: { not: null, lte: in60Days },
    },
    select: { id: true, name: true, spz: true, category: true, tachographRevisionNextDate: true, tachographRevisionDate: true },
    orderBy: { tachographRevisionNextDate: "asc" },
  });

  return jsonResponse({
    totalVehicles,
    activeVehicles,
    inactiveVehicles,
    byCategory,
    stkExpired,
    stkSoon,
    openTasks,
    urgentTasks,
    upcomingDeadlines,
    stkAlertVehicles,
    oilAlertVehicles,
    tachDownloadAlertVehicles,
    tachRevisionAlertVehicles,
  });
}
