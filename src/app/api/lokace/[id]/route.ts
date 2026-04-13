import { prisma } from "@/lib/prisma";
import { requirePermission, jsonResponse, errorResponse } from "@/lib/api-helpers";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requirePermission("manage_locations");
  if (error) return error;

  const { id } = await params;
  const location = await prisma.location.findUnique({ where: { id } });
  if (!location) return errorResponse("Lokace nenalezena", 404);
  return jsonResponse(location);
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requirePermission("manage_locations");
  if (error) return error;

  const { id } = await params;
  const body = await req.json();

  const location = await prisma.location.update({
    where: { id },
    data: {
      name: body.name,
      code: body.code?.toUpperCase(),
      address: body.address || null,
      gps: body.gps || null,
      active: body.active,
      note: body.note || null,
    },
  });
  return jsonResponse(location);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requirePermission("manage_locations");
  if (error) return error;

  const { id } = await params;
  await prisma.location.update({
    where: { id },
    data: { active: false },
  });
  return jsonResponse({ success: true });
}
