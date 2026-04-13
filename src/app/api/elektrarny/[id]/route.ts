import { prisma } from "@/lib/prisma";
import { requirePermission, jsonResponse, errorResponse } from "@/lib/api-helpers";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requirePermission("manage_power_plants");
  if (error) return error;

  const { id } = await params;
  const powerPlant = await prisma.powerPlant.findUnique({ where: { id } });
  if (!powerPlant) return errorResponse("Elektrárna nenalezena", 404);
  return jsonResponse(powerPlant);
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requirePermission("manage_power_plants");
  if (error) return error;

  const { id } = await params;
  const body = await req.json();

  const powerPlant = await prisma.powerPlant.update({
    where: { id },
    data: {
      name: body.name,
      address: body.address || null,
      contactPerson: body.contactPerson || null,
      phone: body.phone || null,
      email: body.email || null,
      active: body.active,
      note: body.note || null,
    },
  });
  return jsonResponse(powerPlant);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requirePermission("manage_power_plants");
  if (error) return error;

  const { id } = await params;
  await prisma.powerPlant.update({
    where: { id },
    data: { active: false },
  });
  return jsonResponse({ success: true });
}
