import { prisma } from "@/lib/prisma";
import { requirePermission, jsonResponse, errorResponse } from "@/lib/api-helpers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return errorResponse("Nepřihlášen", 401);

  const { id } = await params;
  const transport = await prisma.transport.findUnique({
    where: { id },
    include: {
      driver: true,
      deliveryShift: true,
      originLocation: true,
      loadingLocation: true,
      unloadingLocation: true,
      sourceWarehouse: true,
      targetWarehouse: true,
      powerPlant: true,
      customer: true,
      chipper: true,
      createdBy: { select: { firstName: true, lastName: true } },
      updatedBy: { select: { firstName: true, lastName: true } },
    },
  });

  if (!transport) return errorResponse("Přeprava nenalezena", 404);
  return jsonResponse(transport);
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error, session } = await requirePermission("edit_transport");
  if (error) return error;

  const { id } = await params;
  const body = await req.json();

  const transport = await prisma.transport.update({
    where: { id },
    data: {
      status: body.status,
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
      note: body.note || null,
      updatedById: session!.user.id,
    },
  });

  return jsonResponse(transport);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requirePermission("delete_transport");
  if (error) return error;

  const { id } = await params;
  await prisma.transport.update({
    where: { id },
    data: { status: "STORNOVANO" },
  });
  return jsonResponse({ success: true });
}
