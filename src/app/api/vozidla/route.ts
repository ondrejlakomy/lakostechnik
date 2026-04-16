import { prisma } from "@/lib/prisma";
import { requirePermission, jsonResponse, errorResponse } from "@/lib/api-helpers";

export async function GET(req: Request) {
  const { error } = await requirePermission("manage_locations");
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const active = searchParams.get("active");
  const search = searchParams.get("search");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {};

  if (category) {
    where.category = category;
  }

  if (active !== null) {
    where.active = active === "true";
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { spz: { contains: search, mode: "insensitive" } },
      { vin: { contains: search, mode: "insensitive" } },
      { brand: { contains: search, mode: "insensitive" } },
      { model: { contains: search, mode: "insensitive" } },
    ];
  }

  const vehicles = await prisma.vehicle.findMany({
    where,
    include: {
      serviceRecords: {
        orderBy: { date: "desc" },
        take: 3,
      },
      tasks: {
        where: {
          status: { in: ["OTEVRENY", "V_RESENI"] },
        },
      },
      assignedDriver: true,
    },
    orderBy: { name: "asc" },
  });

  const result = vehicles.map((v) => ({
    ...v,
    openTaskCount: v.tasks.length,
  }));

  return jsonResponse(result);
}

export async function POST(req: Request) {
  const { error } = await requirePermission("manage_locations");
  if (error) return error;

  const body = await req.json();

  if (!body.name) {
    return errorResponse("Název vozidla je povinný");
  }
  if (!body.category) {
    return errorResponse("Kategorie vozidla je povinná");
  }

  const validCategories = ["OSOBNI", "NAKLADNI", "PRIPOJNE", "TRAKTOR", "NAKLADAC"];
  if (!validCategories.includes(body.category)) {
    return errorResponse("Neplatná kategorie vozidla");
  }

  const vehicle = await prisma.vehicle.create({
    data: {
      name: body.name,
      category: body.category,
      brand: body.brand || null,
      model: body.model || null,
      variant: body.variant || null,
      nickname: body.nickname || null,
      yearOfManufacture: body.yearOfManufacture ?? null,
      dateOfPurchase: body.dateOfPurchase ? new Date(body.dateOfPurchase) : null,
      purchasePrice: body.purchasePrice ?? null,
      currentValue: body.currentValue ?? null,
      spz: body.spz || null,
      vin: body.vin || null,
      color: body.color || null,
      odometerKm: body.odometerKm ?? null,
      engineHours: body.engineHours ?? null,
      transmission: body.transmission || null,
      engine: body.engine || null,
      payload: body.payload ?? null,
      grossWeight: body.grossWeight ?? null,
      operatingWeight: body.operatingWeight ?? null,
      tireSize: body.tireSize || null,
      tireType: body.tireType || null,
      tireCondition: body.tireCondition ?? null,
      axleCount: body.axleCount ?? null,
      assignedDriverId: body.assignedDriverId || null,
      active: body.active ?? true,
      note: body.note || null,
      stkDate: body.stkDate ? new Date(body.stkDate) : null,
      stkNextDate: body.stkNextDate ? new Date(body.stkNextDate) : null,
      oilChangeDate: body.oilChangeDate ? new Date(body.oilChangeDate) : null,
      oilChangeKm: body.oilChangeKm ?? null,
      oilChangeHours: body.oilChangeHours ?? null,
      oilNextKm: body.oilNextKm ?? null,
      oilNextDate: body.oilNextDate ? new Date(body.oilNextDate) : null,
      oilNextHours: body.oilNextHours ?? null,
      filterChangeDate: body.filterChangeDate ? new Date(body.filterChangeDate) : null,
      filterNextDate: body.filterNextDate ? new Date(body.filterNextDate) : null,
      lastServiceDate: body.lastServiceDate ? new Date(body.lastServiceDate) : null,
      lastServiceKm: body.lastServiceKm ?? null,
      nextServiceDate: body.nextServiceDate ? new Date(body.nextServiceDate) : null,
      nextServiceKm: body.nextServiceKm ?? null,
    },
  });

  return jsonResponse(vehicle, 201);
}
