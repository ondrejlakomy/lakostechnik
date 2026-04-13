import { prisma } from "@/lib/prisma";
import { requirePermission, jsonResponse, errorResponse } from "@/lib/api-helpers";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requirePermission("manage_shifts");
  if (error) return error;

  const { id } = await params;
  const shift = await prisma.deliveryShift.findUnique({ where: { id } });
  if (!shift) return errorResponse("Turnus nenalezen", 404);
  return jsonResponse(shift);
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requirePermission("manage_shifts");
  if (error) return error;

  const { id } = await params;
  const body = await req.json();

  const shift = await prisma.deliveryShift.update({
    where: { id },
    data: {
      name: body.name,
      dateFrom: body.dateFrom ? new Date(body.dateFrom) : null,
      dateTo: body.dateTo ? new Date(body.dateTo) : null,
      active: body.active,
      closed: body.closed,
      note: body.note || null,
    },
  });
  return jsonResponse(shift);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requirePermission("manage_shifts");
  if (error) return error;

  const { id } = await params;
  await prisma.deliveryShift.update({
    where: { id },
    data: { active: false },
  });
  return jsonResponse({ success: true });
}
