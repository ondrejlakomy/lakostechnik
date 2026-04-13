import { prisma } from "@/lib/prisma";
import { requirePermission, jsonResponse, errorResponse } from "@/lib/api-helpers";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requirePermission("manage_drivers");
  if (error) return error;

  const { id } = await params;
  const driver = await prisma.driver.findUnique({
    where: { id },
    include: { vehicles: { where: { active: true } } },
  });
  if (!driver) return errorResponse("Řidič nenalezen", 404);
  return jsonResponse(driver);
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requirePermission("manage_drivers");
  if (error) return error;

  const { id } = await params;
  const body = await req.json();

  const driver = await prisma.driver.update({
    where: { id },
    data: {
      firstName: body.firstName,
      lastName: body.lastName,
      phone: body.phone || null,
      code: body.code?.toUpperCase(),
      defaultSpz: body.defaultSpz || null,
      active: body.active,
      note: body.note || null,
    },
  });
  return jsonResponse(driver);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requirePermission("manage_drivers");
  if (error) return error;

  const { id } = await params;
  await prisma.driver.update({
    where: { id },
    data: { active: false },
  });
  return jsonResponse({ success: true });
}
