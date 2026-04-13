import { prisma } from "@/lib/prisma";
import { requirePermission, jsonResponse, errorResponse } from "@/lib/api-helpers";
import bcrypt from "bcryptjs";

export async function GET() {
  const { error } = await requirePermission("manage_users");
  if (error) return error;

  const users = await prisma.user.findMany({
    include: { driver: true },
    orderBy: { lastName: "asc" },
  });

  const usersWithoutPassword = users.map(({ password: _, ...user }) => user);
  return jsonResponse(usersWithoutPassword);
}

export async function POST(req: Request) {
  const { error } = await requirePermission("manage_users");
  if (error) return error;

  const body = await req.json();

  if (!body.email) return errorResponse("E-mail je povinný");
  if (!body.password) return errorResponse("Heslo je povinné");
  if (!body.firstName) return errorResponse("Jméno je povinné");
  if (!body.lastName) return errorResponse("Příjmení je povinné");

  const existing = await prisma.user.findUnique({ where: { email: body.email } });
  if (existing) return errorResponse("Uživatel s tímto e-mailem již existuje");

  const hashedPassword = await bcrypt.hash(body.password, 12);

  const user = await prisma.user.create({
    data: {
      email: body.email,
      password: hashedPassword,
      firstName: body.firstName,
      lastName: body.lastName,
      phone: body.phone || null,
      role: body.role || "USER_L2",
      active: body.active ?? true,
      driverId: body.driverId || null,
    },
  });

  const { password: _, ...userWithoutPassword } = user;
  return jsonResponse(userWithoutPassword, 201);
}
