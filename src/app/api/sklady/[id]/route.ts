import { prisma } from "@/lib/prisma";
import { requirePermission, jsonResponse, errorResponse } from "@/lib/api-helpers";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requirePermission("manage_warehouses");
  if (error) return error;

  const { id } = await params;
  const warehouse = await prisma.warehouse.findUnique({ where: { id }, include: { location: true } });
  if (!warehouse) return errorResponse("Sklad nenalezen", 404);
  return jsonResponse(warehouse);
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requirePermission("manage_warehouses");
  if (error) return error;

  const { id } = await params;
  const body = await req.json();

  const warehouse = await prisma.warehouse.update({
    where: { id },
    data: {
      name: body.name,
      code: body.code?.toUpperCase(),
      type: body.type,
      locationId: body.locationId || null,
      address: body.address || null,
      unit: body.unit,
      active: body.active,
      note: body.note || null,
    },
  });
  return jsonResponse(warehouse);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requirePermission("manage_warehouses");
  if (error) return error;

  const { id } = await params;
  await prisma.warehouse.update({
    where: { id },
    data: { active: false },
  });
  return jsonResponse({ success: true });
}
