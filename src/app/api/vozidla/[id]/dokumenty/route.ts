import { prisma } from "@/lib/prisma";
import { requirePermission, jsonResponse, errorResponse } from "@/lib/api-helpers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requirePermission("manage_locations");
  if (error) return error;

  const { id } = await params;
  const documents = await prisma.vehicleDocument.findMany({
    where: { vehicleId: id },
    select: {
      id: true, name: true, fileName: true, fileSize: true, note: true, createdAt: true,
      uploadedBy: { select: { firstName: true, lastName: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return jsonResponse(documents);
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requirePermission("manage_locations");
  if (error) return error;

  const session = await getServerSession(authOptions);
  const { id } = await params;

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const name = (formData.get("name") as string) || "";
  const note = (formData.get("note") as string) || "";

  if (!file) return errorResponse("Soubor je povinný");
  if (file.size > 10 * 1024 * 1024) return errorResponse("Maximální velikost souboru je 10 MB");

  // Převést na base64 a uložit do DB
  const buffer = Buffer.from(await file.arrayBuffer());
  const base64 = buffer.toString("base64");
  const dataUrl = `data:${file.type};base64,${base64}`;

  const document = await prisma.vehicleDocument.create({
    data: {
      vehicleId: id,
      name: name || file.name,
      fileName: file.name,
      fileUrl: dataUrl,
      fileSize: file.size,
      note: note || null,
      uploadedById: session?.user?.id || null,
    },
  });

  // Vrátit bez fileUrl (je velká)
  return jsonResponse({ ...document, fileUrl: undefined }, 201);
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requirePermission("manage_locations");
  if (error) return error;

  await params;
  const { searchParams } = new URL(req.url);
  const docId = searchParams.get("docId");

  if (!docId) return errorResponse("docId je povinné");

  await prisma.vehicleDocument.delete({ where: { id: docId } });

  return jsonResponse({ success: true });
}
