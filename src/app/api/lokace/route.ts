import { prisma } from "@/lib/prisma";
import { requirePermission, jsonResponse, errorResponse } from "@/lib/api-helpers";

export async function GET() {
  const { error } = await requirePermission("manage_locations");
  if (error) return error;

  const locations = await prisma.location.findMany({
    orderBy: { name: "asc" },
  });
  return jsonResponse(locations);
}

export async function POST(req: Request) {
  const { error } = await requirePermission("manage_locations");
  if (error) return error;

  const body = await req.json();
  if (!body.name || !body.code) {
    return errorResponse("Název a kód jsou povinné");
  }

  const existing = await prisma.location.findUnique({ where: { code: body.code } });
  if (existing) {
    return errorResponse("Lokace s tímto kódem již existuje");
  }

  const location = await prisma.location.create({
    data: {
      name: body.name,
      code: body.code.toUpperCase(),
      address: body.address || null,
      gps: body.gps || null,
      active: body.active ?? true,
      note: body.note || null,
    },
  });
  return jsonResponse(location, 201);
}
