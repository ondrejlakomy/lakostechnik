import { prisma } from "@/lib/prisma";
import { requirePermission, errorResponse } from "@/lib/api-helpers";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { error } = await requirePermission("view_exports");
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const format = searchParams.get("format") || "csv";
  const entity = searchParams.get("entity") || "transports";
  const dateFrom = searchParams.get("dateFrom");
  const dateTo = searchParams.get("dateTo");

  const dateFilter: Record<string, unknown> = {};
  if (dateFrom) dateFilter.gte = new Date(dateFrom);
  if (dateTo) dateFilter.lte = new Date(dateTo + "T23:59:59");
  const hasDate = dateFrom || dateTo;

  if (entity === "transports") {
    const where: Record<string, unknown> = {};
    if (hasDate) where.createdAt = dateFilter;

    const transports = await prisma.transport.findMany({
      where,
      include: {
        driver: true,
        deliveryShift: true,
        originLocation: true,
        powerPlant: true,
        customer: true,
        chipper: true,
      },
      orderBy: { createdAt: "desc" },
    });

    if (format === "csv") {
      const header = "Číslo;Stav;Datum;Dodací list;Vážní lístek;Výzva;Nakládka;Vykládka;Řidič;SPZ;Km;Netto (t);PRM;Turnus;Elektrárna;Odběratel;Štěpkovač\n";
      const rows = transports.map((t) =>
        [
          t.number,
          t.status,
          new Date(t.createdAt).toLocaleDateString("cs-CZ"),
          t.deliveryNoteNumber || "",
          t.weighingTicketNumber || "",
          t.callNumber || "",
          t.loadingPlace || "",
          t.unloadingPlace || "",
          t.driver ? `${t.driver.firstName} ${t.driver.lastName}` : "",
          t.vehicleSpz || "",
          t.kilometers?.toString() || "",
          t.nettoWeight?.toString() || "",
          t.prm?.toString() || "",
          t.deliveryShift?.name || "",
          t.powerPlant?.name || "",
          t.customer?.name || "",
          t.chipper?.name || "",
        ].join(";")
      ).join("\n");

      const csv = "\uFEFF" + header + rows; // BOM for Czech Excel
      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="prepravy_${new Date().toISOString().split("T")[0]}.csv"`,
        },
      });
    }

    return NextResponse.json(transports);
  }

  return errorResponse("Neznámý typ exportu");
}
