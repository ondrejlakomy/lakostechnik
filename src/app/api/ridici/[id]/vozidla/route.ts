import { prisma } from "@/lib/prisma";
import { requirePermission, jsonResponse, errorResponse } from "@/lib/api-helpers";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requirePermission("manage_drivers");
  if (error) return error;

  const { id } = await params;
  const body = await req.json();

  if (!body.spz) return errorResponse("SPZ je povinná");

  const vehicle = await prisma.driverVehicle.create({
    data: {
      driverId: id,
      spz: body.spz.toUpperCase(),
      name: body.name || null,
    },
  });

  return jsonResponse(vehicle, 201);
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requirePermission("manage_drivers");
  if (error) return error;

  await params;
  const { searchParams } = new URL(req.url);
  const vehicleId = searchParams.get("vehicleId");

  if (!vehicleId) return errorResponse("vehicleId je povinné");

  await prisma.driverVehicle.update({
    where: { id: vehicleId },
    data: { active: false },
  });

  return jsonResponse({ success: true });
}
