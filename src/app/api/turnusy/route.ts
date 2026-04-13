import { prisma } from "@/lib/prisma";
import { requirePermission, jsonResponse, errorResponse } from "@/lib/api-helpers";

export async function GET() {
  const { error } = await requirePermission("manage_shifts");
  if (error) return error;

  const shifts = await prisma.deliveryShift.findMany({
    orderBy: { name: "asc" },
  });
  return jsonResponse(shifts);
}

export async function POST(req: Request) {
  const { error } = await requirePermission("manage_shifts");
  if (error) return error;

  const body = await req.json();
  if (!body.name) {
    return errorResponse("Název je povinný");
  }

  const shift = await prisma.deliveryShift.create({
    data: {
      name: body.name,
      dateFrom: body.dateFrom ? new Date(body.dateFrom) : null,
      dateTo: body.dateTo ? new Date(body.dateTo) : null,
      active: body.active ?? true,
      closed: body.closed ?? false,
      note: body.note || null,
    },
  });
  return jsonResponse(shift, 201);
}
