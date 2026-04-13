import { prisma } from "@/lib/prisma";
import { requirePermission, jsonResponse, errorResponse } from "@/lib/api-helpers";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requirePermission("manage_customers");
  if (error) return error;

  const { id } = await params;
  const customer = await prisma.customer.findUnique({ where: { id } });
  if (!customer) return errorResponse("Odběratel nenalezen", 404);
  return jsonResponse(customer);
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requirePermission("manage_customers");
  if (error) return error;

  const { id } = await params;
  const body = await req.json();

  const customer = await prisma.customer.update({
    where: { id },
    data: {
      name: body.name,
      ico: body.ico || null,
      address: body.address || null,
      contactPerson: body.contactPerson || null,
      phone: body.phone || null,
      email: body.email || null,
      active: body.active,
      note: body.note || null,
    },
  });
  return jsonResponse(customer);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requirePermission("manage_customers");
  if (error) return error;

  const { id } = await params;
  await prisma.customer.update({
    where: { id },
    data: { active: false },
  });
  return jsonResponse({ success: true });
}
