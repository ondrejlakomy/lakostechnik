import { prisma } from "@/lib/prisma";
import { requirePermission, jsonResponse, errorResponse } from "@/lib/api-helpers";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requirePermission("manage_locations");
  if (error) return error;

  const { id } = await params;

  const vehicle = await prisma.vehicle.findUnique({ where: { id } });
  if (!vehicle) {
    return errorResponse("Vozidlo nenalezeno", 404);
  }

  const records = await prisma.vehicleServiceRecord.findMany({
    where: { vehicleId: id },
    orderBy: { date: "desc" },
    include: {
      createdBy: { select: { firstName: true, lastName: true } },
    },
  });

  return jsonResponse(records);
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, session } = await requirePermission("manage_locations");
  if (error) return error;

  const { id } = await params;
  const body = await req.json();

  const vehicle = await prisma.vehicle.findUnique({ where: { id } });
  if (!vehicle) {
    return errorResponse("Vozidlo nenalezeno", 404);
  }

  if (!body.date) {
    return errorResponse("Datum je povinné");
  }
  if (!body.type) {
    return errorResponse("Typ servisu je povinný");
  }

  const validTypes = [
    "OLEJ", "OLEJ_FILTRY", "STK", "PNEUSERVIS", "OPRAVA",
    "BEZNY_SERVIS", "MIMORADNY", "DETAILING", "KLIMATIZACE",
    "EOBD", "KAROSERIE", "JINY",
  ];
  if (!validTypes.includes(body.type)) {
    return errorResponse("Neplatný typ servisního záznamu");
  }

  // Create the service record
  const record = await prisma.vehicleServiceRecord.create({
    data: {
      vehicleId: id,
      date: new Date(body.date),
      type: body.type,
      description: body.description || null,
      odometerKm: body.odometerKm ?? null,
      engineHours: body.engineHours ?? null,
      cost: body.cost ?? null,
      supplier: body.supplier || null,
      note: body.note || null,
      createdById: session.user.id,
    },
  });

  // Update vehicle fields based on service record
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const vehicleUpdate: any = {};

  // Update odometer if provided and higher than current
  if (body.odometerKm != null && (vehicle.odometerKm == null || body.odometerKm > vehicle.odometerKm)) {
    vehicleUpdate.odometerKm = body.odometerKm;
  }

  // Update engine hours if provided and higher than current
  if (body.engineHours != null && (vehicle.engineHours == null || body.engineHours > vehicle.engineHours)) {
    vehicleUpdate.engineHours = body.engineHours;
  }

  // Oil change updates
  if (body.type === "OLEJ" || body.type === "OLEJ_FILTRY") {
    vehicleUpdate.oilChangeDate = new Date(body.date);
    if (body.odometerKm != null) {
      vehicleUpdate.oilChangeKm = body.odometerKm;
    }
    if (body.engineHours != null) {
      vehicleUpdate.oilChangeHours = body.engineHours;
    }
  }

  // STK update
  if (body.type === "STK") {
    vehicleUpdate.stkDate = new Date(body.date);
  }

  if (Object.keys(vehicleUpdate).length > 0) {
    await prisma.vehicle.update({
      where: { id },
      data: vehicleUpdate,
    });
  }

  return jsonResponse(record, 201);
}
