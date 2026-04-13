import { prisma } from "@/lib/prisma";
import { requirePermission, jsonResponse, errorResponse } from "@/lib/api-helpers";

export async function GET() {
  const { error } = await requirePermission("manage_power_plants");
  if (error) return error;

  const powerPlants = await prisma.powerPlant.findMany({
    orderBy: { name: "asc" },
  });
  return jsonResponse(powerPlants);
}

export async function POST(req: Request) {
  const { error } = await requirePermission("manage_power_plants");
  if (error) return error;

  const body = await req.json();
  if (!body.name) {
    return errorResponse("Název je povinný");
  }

  const powerPlant = await prisma.powerPlant.create({
    data: {
      name: body.name,
      address: body.address || null,
      contactPerson: body.contactPerson || null,
      phone: body.phone || null,
      email: body.email || null,
      active: body.active ?? true,
      note: body.note || null,
    },
  });
  return jsonResponse(powerPlant, 201);
}
