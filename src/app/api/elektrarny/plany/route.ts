import { prisma } from "@/lib/prisma";
import { requirePermission, jsonResponse, errorResponse } from "@/lib/api-helpers";

export async function GET(req: Request) {
  const { error } = await requirePermission("manage_power_plants");
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const powerPlantId = searchParams.get("powerPlantId");
  const weekStart = searchParams.get("weekStart");

  const where: Record<string, unknown> = {};
  if (powerPlantId) where.powerPlantId = powerPlantId;
  if (weekStart) where.weekStart = new Date(weekStart);

  const plans = await prisma.powerPlantWeeklyPlan.findMany({
    where,
    include: { powerPlant: true },
    orderBy: { weekStart: "desc" },
  });

  // Pro každý plán spočítat skutečně odvezené PRM z přeprav
  const plansWithProgress = await Promise.all(
    plans.map(async (plan) => {
      const weekEnd = new Date(plan.weekStart);
      weekEnd.setDate(weekEnd.getDate() + 5); // Po-Pá = 5 dní

      const transports = await prisma.transport.findMany({
        where: {
          powerPlantId: plan.powerPlantId,
          status: { not: "STORNOVANO" },
          createdAt: {
            gte: plan.weekStart,
            lt: weekEnd,
          },
        },
        select: { prm: true },
      });

      const deliveredPrm = transports.reduce((sum, t) => sum + (t.prm || 0), 0);
      const percentage = plan.targetPrm > 0 ? Math.round((deliveredPrm / plan.targetPrm) * 100) : 0;

      return {
        ...plan,
        deliveredPrm,
        percentage,
        remaining: Math.max(0, plan.targetPrm - deliveredPrm),
      };
    })
  );

  return jsonResponse(plansWithProgress);
}

export async function POST(req: Request) {
  const { error } = await requirePermission("manage_power_plants");
  if (error) return error;

  const body = await req.json();
  if (!body.powerPlantId || !body.weekStart || !body.targetPrm) {
    return errorResponse("Elektrárna, začátek týdne a cílové PRM jsou povinné");
  }

  const weekStart = new Date(body.weekStart);
  // Zarovnat na pondělí
  const day = weekStart.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  weekStart.setDate(weekStart.getDate() + diff);
  weekStart.setHours(0, 0, 0, 0);

  const plan = await prisma.powerPlantWeeklyPlan.upsert({
    where: {
      powerPlantId_weekStart: {
        powerPlantId: body.powerPlantId,
        weekStart,
      },
    },
    update: {
      targetPrm: parseFloat(body.targetPrm),
      note: body.note || null,
    },
    create: {
      powerPlantId: body.powerPlantId,
      weekStart,
      targetPrm: parseFloat(body.targetPrm),
      note: body.note || null,
    },
  });

  return jsonResponse(plan, 201);
}
