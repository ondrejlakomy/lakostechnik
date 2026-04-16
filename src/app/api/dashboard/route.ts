import { prisma } from "@/lib/prisma";
import { getSessionOrError, jsonResponse } from "@/lib/api-helpers";

export async function GET(req: Request) {
  const { error } = await getSessionOrError();
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const dateFrom = searchParams.get("dateFrom");
  const dateTo = searchParams.get("dateTo");

  const dateFilter: Record<string, unknown> = {};
  if (dateFrom) dateFilter.gte = new Date(dateFrom);
  if (dateTo) dateFilter.lte = new Date(dateTo + "T23:59:59");
  const hasDateFilter = dateFrom || dateTo;

  // Zásoby na skladech
  const warehouses = await prisma.warehouse.findMany({
    where: { active: true },
    select: { id: true, name: true, code: true, currentStock: true, unit: true },
    orderBy: { name: "asc" },
  });

  const totalStock = warehouses.reduce((sum, w) => sum + w.currentStock, 0);

  // Přepravy v období
  const transportWhere: Record<string, unknown> = {
    status: { not: "STORNOVANO" },
  };
  if (hasDateFilter) transportWhere.createdAt = dateFilter;

  const transports = await prisma.transport.findMany({
    where: transportWhere,
    include: {
      driver: true,
      powerPlant: true,
      customer: true,
      chipper: true,
      originLocation: true,
      deliveryShift: true,
    },
  });

  const totalTransports = transports.length;
  const totalWeight = transports.reduce((sum, t) => sum + (t.nettoWeight || 0), 0);
  const totalKm = transports.reduce((sum, t) => sum + (t.kilometers || 0), 0);
  const totalPrm = transports.reduce((sum, t) => sum + (t.prm || 0), 0);

  // Agregace podle elektráren
  const byPowerPlant: Record<string, { name: string; weight: number; count: number }> = {};
  transports.forEach((t) => {
    if (t.powerPlant) {
      const key = t.powerPlant.id;
      if (!byPowerPlant[key]) byPowerPlant[key] = { name: t.powerPlant.name, weight: 0, count: 0 };
      byPowerPlant[key].weight += t.nettoWeight || 0;
      byPowerPlant[key].count++;
    }
  });

  // Agregace podle odběratelů
  const byCustomer: Record<string, { name: string; weight: number; count: number }> = {};
  transports.forEach((t) => {
    if (t.customer) {
      const key = t.customer.id;
      if (!byCustomer[key]) byCustomer[key] = { name: t.customer.name, weight: 0, count: 0 };
      byCustomer[key].weight += t.nettoWeight || 0;
      byCustomer[key].count++;
    }
  });

  // Agregace podle řidičů
  const byDriver: Record<string, { name: string; weight: number; km: number; count: number }> = {};
  transports.forEach((t) => {
    if (t.driver) {
      const key = t.driver.id;
      if (!byDriver[key]) byDriver[key] = { name: `${t.driver.firstName} ${t.driver.lastName}`, weight: 0, km: 0, count: 0 };
      byDriver[key].weight += t.nettoWeight || 0;
      byDriver[key].km += t.kilometers || 0;
      byDriver[key].count++;
    }
  });

  // Agregace podle štěpkovačů
  const byChipper: Record<string, { name: string; weight: number; count: number }> = {};
  transports.forEach((t) => {
    if (t.chipper) {
      const key = t.chipper.id;
      if (!byChipper[key]) byChipper[key] = { name: t.chipper.name, weight: 0, count: 0 };
      byChipper[key].weight += t.nettoWeight || 0;
      byChipper[key].count++;
    }
  });

  // Agregace podle lokací
  const byLocation: Record<string, { name: string; weight: number; count: number }> = {};
  transports.forEach((t) => {
    if (t.originLocation) {
      const key = t.originLocation.id;
      if (!byLocation[key]) byLocation[key] = { name: t.originLocation.name, weight: 0, count: 0 };
      byLocation[key].weight += t.nettoWeight || 0;
      byLocation[key].count++;
    }
  });

  // Agregace podle turnusů
  const byShift: Record<string, { name: string; weight: number; count: number }> = {};
  transports.forEach((t) => {
    if (t.deliveryShift) {
      const key = t.deliveryShift.id;
      if (!byShift[key]) byShift[key] = { name: t.deliveryShift.name, weight: 0, count: 0 };
      byShift[key].weight += t.nettoWeight || 0;
      byShift[key].count++;
    }
  });

  // Týdenní plány elektráren - aktuální týden
  const now = new Date();
  const day = now.getDay();
  const diffToMon = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(monday.getDate() + diffToMon);
  monday.setHours(0, 0, 0, 0);
  const friday = new Date(monday);
  friday.setDate(friday.getDate() + 5);

  const weeklyPlans = await prisma.powerPlantWeeklyPlan.findMany({
    where: { weekStart: monday },
    include: { powerPlant: true },
  });

  const weeklyPlansWithProgress = await Promise.all(
    weeklyPlans.map(async (plan) => {
      const weekTransports = await prisma.transport.findMany({
        where: {
          powerPlantId: plan.powerPlantId,
          status: { not: "STORNOVANO" },
          createdAt: { gte: monday, lt: friday },
        },
        select: { prm: true },
      });
      const deliveredPrm = weekTransports.reduce((sum, t) => sum + (t.prm || 0), 0);
      const percentage = plan.targetPrm > 0 ? Math.round((deliveredPrm / plan.targetPrm) * 100) : 0;
      return {
        powerPlantName: plan.powerPlant.name,
        targetPrm: plan.targetPrm,
        deliveredPrm,
        percentage,
        remaining: Math.max(0, plan.targetPrm - deliveredPrm),
      };
    })
  );

  // ========= VOZIDLA – kritické termíny =========
  const now2 = new Date();
  const in30 = new Date();
  in30.setDate(in30.getDate() + 30);

  const vehicleAlerts = await prisma.vehicle.findMany({
    where: {
      active: true,
      OR: [
        { stkNextDate: { lte: in30 } },
        { oilNextDate: { lte: in30 } },
        { tachographDownloadNextDate: { lte: in30 } },
        { tachographRevisionNextDate: { lte: in30 } },
      ],
    },
    select: {
      id: true,
      name: true,
      spz: true,
      stkNextDate: true,
      oilNextDate: true,
      tachographDownloadNextDate: true,
      tachographRevisionNextDate: true,
      _count: { select: { tasks: { where: { status: { in: ["OTEVRENY", "V_RESENI"] } } } } },
    },
    orderBy: { name: "asc" },
  });

  // Transformovat na seznam alertů
  const vehicleCritical: { vehicleId: string; vehicleName: string; spz: string | null; type: string; date: string }[] = [];
  for (const v of vehicleAlerts) {
    if (v.stkNextDate && v.stkNextDate <= in30) {
      vehicleCritical.push({ vehicleId: v.id, vehicleName: v.name, spz: v.spz, type: "STK", date: v.stkNextDate.toISOString() });
    }
    if (v.oilNextDate && v.oilNextDate <= in30) {
      vehicleCritical.push({ vehicleId: v.id, vehicleName: v.name, spz: v.spz, type: "Olej", date: v.oilNextDate.toISOString() });
    }
    if (v.tachographDownloadNextDate && v.tachographDownloadNextDate <= in30) {
      vehicleCritical.push({ vehicleId: v.id, vehicleName: v.name, spz: v.spz, type: "Stažení tachografu", date: v.tachographDownloadNextDate.toISOString() });
    }
    if (v.tachographRevisionNextDate && v.tachographRevisionNextDate <= in30) {
      vehicleCritical.push({ vehicleId: v.id, vehicleName: v.name, spz: v.spz, type: "Revize tachografu", date: v.tachographRevisionNextDate.toISOString() });
    }
  }
  vehicleCritical.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return jsonResponse({
    totalStock,
    totalTransports,
    totalWeight,
    totalKm,
    totalPrm,
    warehouses,
    byPowerPlant: Object.values(byPowerPlant),
    byCustomer: Object.values(byCustomer),
    byDriver: Object.values(byDriver),
    byChipper: Object.values(byChipper),
    byLocation: Object.values(byLocation),
    byShift: Object.values(byShift),
    weeklyPlans: weeklyPlansWithProgress,
    vehicleCritical,
  });
}
