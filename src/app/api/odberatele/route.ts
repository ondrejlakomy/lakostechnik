import { prisma } from "@/lib/prisma";
import { requirePermission, jsonResponse, errorResponse } from "@/lib/api-helpers";

export async function GET() {
  const { error } = await requirePermission("manage_customers");
  if (error) return error;

  const customers = await prisma.customer.findMany({
    orderBy: { name: "asc" },
  });
  return jsonResponse(customers);
}

export async function POST(req: Request) {
  const { error } = await requirePermission("manage_customers");
  if (error) return error;

  const body = await req.json();
  if (!body.name) {
    return errorResponse("Název je povinný");
  }

  const customer = await prisma.customer.create({
    data: {
      name: body.name,
      ico: body.ico || null,
      address: body.address || null,
      contactPerson: body.contactPerson || null,
      phone: body.phone || null,
      email: body.email || null,
      active: body.active ?? true,
      note: body.note || null,
    },
  });
  return jsonResponse(customer, 201);
}
