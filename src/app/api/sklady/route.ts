import { prisma } from "@/lib/prisma";
import { requirePermission, jsonResponse, errorResponse } from "@/lib/api-helpers";

export async function GET() {
  const { error } = await requirePermission("manage_warehouses");
  if (error) return error;

  const warehouses = await prisma.warehouse.findMany({
    orderBy: { name: "asc" },
    include: { location: true },
  });
  return jsonResponse(warehouses);
}

export async function POST(req: Request) {
  const { error } = await requirePermission("manage_warehouses");
  if (error) return error;

  const body = await req.json();
  if (!body.name || !body.code) {
    return errorResponse("Název a kód jsou povinné");
  }

  const existing = await prisma.warehouse.findUnique({ where: { code: body.code.toUpperCase() } });
  if (existing) {
    return errorResponse("Sklad s tímto kódem již existuje");
  }

  const warehouse = await prisma.warehouse.create({
    data: {
      name: body.name,
      code: body.code.toUpperCase(),
      type: body.type || "SKLAD",
      locationId: body.locationId || null,
      address: body.address || null,
      unit: body.unit || "t",
      currentStock: 0,
      active: body.active ?? true,
      note: body.note || null,
    },
  });
  return jsonResponse(warehouse, 201);
}
