import { prisma } from "@/lib/prisma";
import { requirePermission, jsonResponse, errorResponse } from "@/lib/api-helpers";

export async function GET() {
  const { error } = await requirePermission("manage_drivers");
  if (error) return error;

  const drivers = await prisma.driver.findMany({
    include: { vehicles: { where: { active: true } } },
    orderBy: { lastName: "asc" },
  });
  return jsonResponse(drivers);
}

export async function POST(req: Request) {
  const { error } = await requirePermission("manage_drivers");
  if (error) return error;

  const body = await req.json();
  if (!body.firstName || !body.lastName || !body.code) {
    return errorResponse("Jméno, příjmení a kód jsou povinné");
  }

  const existing = await prisma.driver.findUnique({ where: { code: body.code.toUpperCase() } });
  if (existing) {
    return errorResponse("Řidič s tímto kódem již existuje");
  }

  const driver = await prisma.driver.create({
    data: {
      firstName: body.firstName,
      lastName: body.lastName,
      phone: body.phone || null,
      code: body.code.toUpperCase(),
      defaultSpz: body.defaultSpz || null,
      active: body.active ?? true,
      note: body.note || null,
    },
  });
  return jsonResponse(driver, 201);
}
