import { prisma } from "@/lib/prisma";
import { requirePermission, jsonResponse, errorResponse } from "@/lib/api-helpers";

export async function GET() {
  const { error } = await requirePermission("manage_chippers");
  if (error) return error;

  const chippers = await prisma.chipper.findMany({
    orderBy: { name: "asc" },
  });
  return jsonResponse(chippers);
}

export async function POST(req: Request) {
  const { error } = await requirePermission("manage_chippers");
  if (error) return error;

  const body = await req.json();
  if (!body.name) {
    return errorResponse("Název je povinný");
  }

  const chipper = await prisma.chipper.create({
    data: {
      name: body.name,
      internalCode: body.internalCode || null,
      serialNumber: body.serialNumber || null,
      active: body.active ?? true,
      note: body.note || null,
    },
  });
  return jsonResponse(chipper, 201);
}
