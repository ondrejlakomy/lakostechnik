import { prisma } from "@/lib/prisma";
import { requirePermission, jsonResponse, errorResponse } from "@/lib/api-helpers";
import bcrypt from "bcryptjs";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requirePermission("manage_users");
  if (error) return error;

  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id },
    include: { driver: true },
  });
  if (!user) return errorResponse("Uživatel nenalezen", 404);

  const { password: _, ...userWithoutPassword } = user;
  return jsonResponse(userWithoutPassword);
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requirePermission("manage_users");
  if (error) return error;

  const { id } = await params;
  const body = await req.json();

  const data: Record<string, unknown> = {
    email: body.email,
    firstName: body.firstName,
    lastName: body.lastName,
    phone: body.phone || null,
    role: body.role,
    active: body.active,
    driverId: body.driverId || null,
  };

  if (body.password && body.password.length > 0) {
    data.password = await bcrypt.hash(body.password, 12);
  }

  const user = await prisma.user.update({
    where: { id },
    data,
  });

  const { password: _, ...userWithoutPassword } = user;
  return jsonResponse(userWithoutPassword);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requirePermission("manage_users");
  if (error) return error;

  const { id } = await params;
  await prisma.user.update({
    where: { id },
    data: { active: false },
  });
  return jsonResponse({ success: true });
}
