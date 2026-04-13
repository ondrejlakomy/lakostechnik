import { prisma } from "@/lib/prisma";
import { requirePermission, jsonResponse, errorResponse } from "@/lib/api-helpers";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requirePermission("manage_locations");
  if (error) return error;

  const { id } = await params;

  const vehicle = await prisma.vehicle.findUnique({ where: { id } });
  if (!vehicle) {
    return errorResponse("Vozidlo nenalezeno", 404);
  }

  const tasks = await prisma.vehicleTask.findMany({
    where: { vehicleId: id },
    orderBy: { createdAt: "desc" },
    include: {
      createdBy: { select: { firstName: true, lastName: true } },
    },
  });

  return jsonResponse(tasks);
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, session } = await requirePermission("manage_locations");
  if (error) return error;

  const { id } = await params;
  const body = await req.json();

  const vehicle = await prisma.vehicle.findUnique({ where: { id } });
  if (!vehicle) {
    return errorResponse("Vozidlo nenalezeno", 404);
  }

  if (!body.title) {
    return errorResponse("Název úkolu je povinný");
  }

  const validPriorities = ["LOW", "NORMAL", "HIGH", "URGENT"];
  if (body.priority && !validPriorities.includes(body.priority)) {
    return errorResponse("Neplatná priorita úkolu");
  }

  const validStatuses = ["OTEVRENY", "V_RESENI", "HOTOVO", "ZRUSENO"];
  if (body.status && !validStatuses.includes(body.status)) {
    return errorResponse("Neplatný stav úkolu");
  }

  const task = await prisma.vehicleTask.create({
    data: {
      vehicleId: id,
      title: body.title,
      type: body.type || null,
      priority: body.priority || "NORMAL",
      status: body.status || "OTEVRENY",
      dueDate: body.dueDate ? new Date(body.dueDate) : null,
      dueDateKm: body.dueDateKm ?? null,
      dueDateHours: body.dueDateHours ?? null,
      description: body.description || null,
      internalNote: body.internalNote || null,
      assignedPerson: body.assignedPerson || null,
      createdById: session.user.id,
    },
  });

  return jsonResponse(task, 201);
}

export async function PUT(req: Request) {
  const { error } = await requirePermission("manage_locations");
  if (error) return error;

  const body = await req.json();

  if (!body.taskId) {
    return errorResponse("ID úkolu je povinné");
  }

  const existing = await prisma.vehicleTask.findUnique({
    where: { id: body.taskId },
  });
  if (!existing) {
    return errorResponse("Úkol nenalezen", 404);
  }

  const validPriorities = ["LOW", "NORMAL", "HIGH", "URGENT"];
  if (body.priority && !validPriorities.includes(body.priority)) {
    return errorResponse("Neplatná priorita úkolu");
  }

  const validStatuses = ["OTEVRENY", "V_RESENI", "HOTOVO", "ZRUSENO"];
  if (body.status && !validStatuses.includes(body.status)) {
    return errorResponse("Neplatný stav úkolu");
  }

  // If status changes to HOTOVO, set completedAt
  const isCompleting = body.status === "HOTOVO" && existing.status !== "HOTOVO";

  const task = await prisma.vehicleTask.update({
    where: { id: body.taskId },
    data: {
      ...(body.title !== undefined && { title: body.title }),
      ...(body.type !== undefined && { type: body.type || null }),
      ...(body.priority !== undefined && { priority: body.priority }),
      ...(body.status !== undefined && { status: body.status }),
      ...(body.dueDate !== undefined && { dueDate: body.dueDate ? new Date(body.dueDate) : null }),
      ...(body.dueDateKm !== undefined && { dueDateKm: body.dueDateKm }),
      ...(body.dueDateHours !== undefined && { dueDateHours: body.dueDateHours }),
      ...(body.description !== undefined && { description: body.description || null }),
      ...(body.internalNote !== undefined && { internalNote: body.internalNote || null }),
      ...(body.assignedPerson !== undefined && { assignedPerson: body.assignedPerson || null }),
      ...(isCompleting && { completedAt: new Date() }),
    },
  });

  return jsonResponse(task);
}
