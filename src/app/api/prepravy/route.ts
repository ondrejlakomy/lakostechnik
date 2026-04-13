import { prisma } from "@/lib/prisma";
import { requirePermission, jsonResponse, errorResponse } from "@/lib/api-helpers";
import { generateTransportNumber } from "@/lib/number-generator";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return errorResponse("Nepřihlášen", 401);

  const { searchParams } = new URL(req.url);
  const driverId = searchParams.get("driverId");
  const status = searchParams.get("status");
  const dateFrom = searchParams.get("dateFrom");
  const dateTo = searchParams.get("dateTo");
  const locationId = searchParams.get("locationId");
  const warehouseId = searchParams.get("warehouseId");
  const customerId = searchParams.get("customerId");
  const powerPlantId = searchParams.get("powerPlantId");
  const shiftId = searchParams.get("shiftId");

  const where: Record<string, unknown> = {};

  // Řidič vidí jen své záznamy
  if (session.user.role === "DRIVER" && session.user.driverId) {
    where.driverId = session.user.driverId;
  } else if (driverId) {
    where.driverId = driverId;
  }

  if (status) where.status = status;
  if (locationId) where.originLocationId = locationId;
  if (warehouseId) {
    where.OR = [{ sourceWarehouseId: warehouseId }, { targetWarehouseId: warehouseId }];
  }
  if (customerId) where.customerId = customerId;
  if (powerPlantId) where.powerPlantId = powerPlantId;
  if (shiftId) where.deliveryShiftId = shiftId;

  if (dateFrom || dateTo) {
    where.createdAt = {};
    if (dateFrom) (where.createdAt as Record<string, unknown>).gte = new Date(dateFrom);
    if (dateTo) (where.createdAt as Record<string, unknown>).lte = new Date(dateTo + "T23:59:59");
  }

  const transports = await prisma.transport.findMany({
    where,
    include: {
      driver: true,
      deliveryShift: true,
      originLocation: true,
      sourceWarehouse: true,
      targetWarehouse: true,
      powerPlant: true,
      customer: true,
      chipper: true,
      createdBy: { select: { firstName: true, lastName: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return jsonResponse(transports);
}

export async function POST(req: Request) {
  const { error, session } = await requirePermission("create_transport");
  if (error) return error;

  const body = await req.json();

  // Generovat číslo přepravy
  const locationCode = body.locationCode || "GEN";
  const driverCode = body.driverCode || "GEN";
  const number = await generateTransportNumber(locationCode, driverCode);

  const transport = await prisma.transport.create({
    data: {
      number,
      status: body.status || "KONCEPT",
      deliveryShiftId: body.deliveryShiftId || null,
      deliveryNoteNumber: body.deliveryNoteNumber || null,
      weighingTicketNumber: body.weighingTicketNumber || null,
      callNumber: body.callNumber || null,
      loadingPlace: body.loadingPlace || null,
      unloadingPlace: body.unloadingPlace || null,
      originLocationId: body.originLocationId || null,
      loadingLocationId: body.loadingLocationId || null,
      unloadingLocationId: body.unloadingLocationId || null,
      sourceWarehouseId: body.sourceWarehouseId || null,
      targetWarehouseId: body.targetWarehouseId || null,
      powerPlantId: body.powerPlantId || null,
      customerId: body.customerId || null,
      chipperName: body.chipperName || null,
      chipperId: body.chipperId || null,
      driverId: body.driverId || null,
      vehicleSpz: body.vehicleSpz || null,
      kilometers: body.kilometers ? parseFloat(body.kilometers) : null,
      nettoWeight: body.nettoWeight ? parseFloat(body.nettoWeight) : null,
      prm: body.prm ? parseFloat(body.prm) : null,
      unit: body.unit || "t",
      note: body.note || null,
      createdById: session!.user.id,
      updatedById: session!.user.id,
    },
  });

  return jsonResponse(transport, 201);
}
