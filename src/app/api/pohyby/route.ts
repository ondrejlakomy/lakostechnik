import { prisma } from "@/lib/prisma";
import { requirePermission, jsonResponse, errorResponse } from "@/lib/api-helpers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const { error } = await requirePermission("manage_movements");
  if (error) return error;

  const movements = await prisma.materialMovement.findMany({
    include: {
      location: true,
      sourceWarehouse: true,
      targetWarehouse: true,
      chipper: true,
      createdBy: { select: { firstName: true, lastName: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return jsonResponse(movements);
}

export async function POST(req: Request) {
  const { error } = await requirePermission("manage_movements");
  if (error) return error;

  const session = await getServerSession(authOptions);
  const body = await req.json();

  if (!body.type || !body.quantity) {
    return errorResponse("Typ a množství jsou povinné");
  }

  const movement = await prisma.$transaction(async (tx) => {
    const mov = await tx.materialMovement.create({
      data: {
        type: body.type,
        date: body.date ? new Date(body.date) : new Date(),
        locationId: body.locationId || null,
        sourceWarehouseId: body.sourceWarehouseId || null,
        targetWarehouseId: body.targetWarehouseId || null,
        chipperId: body.chipperId || null,
        quantity: parseFloat(body.quantity),
        unit: body.unit || "t",
        note: body.note || null,
        createdById: session?.user?.id || null,
      },
    });

    const qty = parseFloat(body.quantity);

    // Aktualizace zásob podle typu pohybu
    if (body.type === "VYROBA" || body.type === "PRIJEM") {
      if (body.targetWarehouseId) {
        await tx.warehouse.update({
          where: { id: body.targetWarehouseId },
          data: { currentStock: { increment: qty } },
        });
      }
    } else if (body.type === "VYDEJ" || body.type === "ODVOZ") {
      if (body.sourceWarehouseId) {
        await tx.warehouse.update({
          where: { id: body.sourceWarehouseId },
          data: { currentStock: { decrement: qty } },
        });
      }
    } else if (body.type === "PRESUN") {
      if (body.sourceWarehouseId) {
        await tx.warehouse.update({
          where: { id: body.sourceWarehouseId },
          data: { currentStock: { decrement: qty } },
        });
      }
      if (body.targetWarehouseId) {
        await tx.warehouse.update({
          where: { id: body.targetWarehouseId },
          data: { currentStock: { increment: qty } },
        });
      }
    }

    return mov;
  });

  return jsonResponse(movement, 201);
}
