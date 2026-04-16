import { prisma } from "@/lib/prisma";
import { requirePermission, errorResponse } from "@/lib/api-helpers";
import { NextResponse } from "next/server";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string; docId: string }> }) {
  const { error } = await requirePermission("manage_locations");
  if (error) return error;

  const { docId } = await params;

  const doc = await prisma.vehicleDocument.findUnique({ where: { id: docId } });
  if (!doc) return errorResponse("Dokument nenalezen", 404);

  // Dekódovat base64
  const matches = doc.fileUrl.match(/^data:(.+);base64,(.+)$/);
  if (!matches) return errorResponse("Neplatný formát souboru");

  const contentType = matches[1];
  const buffer = Buffer.from(matches[2], "base64");

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `inline; filename="${doc.fileName}"`,
      "Content-Length": buffer.length.toString(),
    },
  });
}
