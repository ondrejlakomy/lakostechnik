import { prisma } from "@/lib/prisma";
import { requirePermission, jsonResponse, errorResponse } from "@/lib/api-helpers";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requirePermission("manage_chippers");
  if (error) return error;

  const { id } = await params;
  const chipper = await prisma.chipper.findUnique({ where: { id } });
  if (!chipper) return errorResponse("Štěpkovač nenalezen", 404);
  return jsonResponse(chipper);
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requirePermission("manage_chippers");
  if (error) return error;

  const { id } = await params;
  const body = await req.json();

  const chipper = await prisma.chipper.update({
    where: { id },
    data: {
      name: body.name,
      internalCode: body.internalCode || null,
      serialNumber: body.serialNumber || null,
      active: body.active,
      note: body.note || null,
    },
  });
  return jsonResponse(chipper);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requirePermission("manage_chippers");
  if (error) return error;

  const { id } = await params;
  await prisma.chipper.update({
    where: { id },
    data: { active: false },
  });
  return jsonResponse({ success: true });
}
