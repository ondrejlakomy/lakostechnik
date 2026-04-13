import { prisma } from "@/lib/prisma";
import { requirePermission, jsonResponse, errorResponse } from "@/lib/api-helpers";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requirePermission("manage_locations");
  if (error) return error;

  const { id } = await params;

  const vehicle = await prisma.vehicle.findUnique({
    where: { id },
    include: {
      serviceRecords: {
        orderBy: { date: "desc" },
        include: { createdBy: { select: { firstName: true, lastName: true } } },
      },
      tasks: {
        orderBy: { createdAt: "desc" },
        include: { createdBy: { select: { firstName: true, lastName: true } } },
      },
      assignedDriver: true,
    },
  });

  if (!vehicle) {
    return errorResponse("Vozidlo nenalezeno", 404);
  }

  return jsonResponse(vehicle);
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requirePermission("manage_locations");
  if (error) return error;

  const { id } = await params;
  const body = await req.json();

  const existing = await prisma.vehicle.findUnique({ where: { id } });
  if (!existing) {
    return errorResponse("Vozidlo nenalezeno", 404);
  }

  if (body.category) {
    const validCategories = ["OSOBNI", "NAKLADNI", "PRIPOJNE", "TRAKTOR", "NAKLADAC"];
    if (!validCategories.includes(body.category)) {
      return errorResponse("Neplatná kategorie vozidla");
    }
  }

  const vehicle = await prisma.vehicle.update({
    where: { id },
    data: {
      ...(body.name !== undefined && { name: body.name }),
      ...(body.category !== undefined && { category: body.category }),
      ...(body.brand !== undefined && { brand: body.brand || null }),
      ...(body.model !== undefined && { model: body.model || null }),
      ...(body.variant !== undefined && { variant: body.variant || null }),
      ...(body.nickname !== undefined && { nickname: body.nickname || null }),
      ...(body.yearOfManufacture !== undefined && { yearOfManufacture: body.yearOfManufacture }),
      ...(body.dateOfPurchase !== undefined && { dateOfPurchase: body.dateOfPurchase ? new Date(body.dateOfPurchase) : null }),
      ...(body.purchasePrice !== undefined && { purchasePrice: body.purchasePrice }),
      ...(body.currentValue !== undefined && { currentValue: body.currentValue }),
      ...(body.spz !== undefined && { spz: body.spz || null }),
      ...(body.vin !== undefined && { vin: body.vin || null }),
      ...(body.color !== undefined && { color: body.color || null }),
      ...(body.odometerKm !== undefined && { odometerKm: body.odometerKm }),
      ...(body.engineHours !== undefined && { engineHours: body.engineHours }),
      ...(body.transmission !== undefined && { transmission: body.transmission || null }),
      ...(body.engine !== undefined && { engine: body.engine || null }),
      ...(body.payload !== undefined && { payload: body.payload }),
      ...(body.grossWeight !== undefined && { grossWeight: body.grossWeight }),
      ...(body.operatingWeight !== undefined && { operatingWeight: body.operatingWeight }),
      ...(body.tireSize !== undefined && { tireSize: body.tireSize || null }),
      ...(body.tireType !== undefined && { tireType: body.tireType || null }),
      ...(body.tireCondition !== undefined && { tireCondition: body.tireCondition }),
      ...(body.axleCount !== undefined && { axleCount: body.axleCount }),
      ...(body.assignedDriverId !== undefined && { assignedDriverId: body.assignedDriverId || null }),
      ...(body.active !== undefined && { active: body.active }),
      ...(body.note !== undefined && { note: body.note || null }),
      ...(body.stkDate !== undefined && { stkDate: body.stkDate ? new Date(body.stkDate) : null }),
      ...(body.stkNextDate !== undefined && { stkNextDate: body.stkNextDate ? new Date(body.stkNextDate) : null }),
      ...(body.oilChangeDate !== undefined && { oilChangeDate: body.oilChangeDate ? new Date(body.oilChangeDate) : null }),
      ...(body.oilChangeKm !== undefined && { oilChangeKm: body.oilChangeKm }),
      ...(body.oilChangeHours !== undefined && { oilChangeHours: body.oilChangeHours }),
      ...(body.oilNextKm !== undefined && { oilNextKm: body.oilNextKm }),
      ...(body.oilNextDate !== undefined && { oilNextDate: body.oilNextDate ? new Date(body.oilNextDate) : null }),
      ...(body.oilNextHours !== undefined && { oilNextHours: body.oilNextHours }),
      ...(body.filterChangeDate !== undefined && { filterChangeDate: body.filterChangeDate ? new Date(body.filterChangeDate) : null }),
      ...(body.filterNextDate !== undefined && { filterNextDate: body.filterNextDate ? new Date(body.filterNextDate) : null }),
      ...(body.lastServiceDate !== undefined && { lastServiceDate: body.lastServiceDate ? new Date(body.lastServiceDate) : null }),
      ...(body.lastServiceKm !== undefined && { lastServiceKm: body.lastServiceKm }),
      ...(body.nextServiceDate !== undefined && { nextServiceDate: body.nextServiceDate ? new Date(body.nextServiceDate) : null }),
      ...(body.nextServiceKm !== undefined && { nextServiceKm: body.nextServiceKm }),
    },
  });

  return jsonResponse(vehicle);
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requirePermission("manage_locations");
  if (error) return error;

  const { id } = await params;

  const existing = await prisma.vehicle.findUnique({ where: { id } });
  if (!existing) {
    return errorResponse("Vozidlo nenalezeno", 404);
  }

  await prisma.vehicle.update({
    where: { id },
    data: { active: false },
  });

  return jsonResponse({ success: true });
}
