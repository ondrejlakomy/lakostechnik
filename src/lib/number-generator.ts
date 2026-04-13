import { prisma } from "./prisma";

export async function generateTransportNumber(
  locationCode: string,
  driverCode: string
): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `${locationCode}-${driverCode}`;

  const sequence = await prisma.numberSequence.upsert({
    where: { prefix_year: { prefix, year } },
    update: { lastNumber: { increment: 1 } },
    create: { prefix, year, lastNumber: 1 },
  });

  const seq = String(sequence.lastNumber).padStart(4, "0");
  return `${prefix}-${seq}-${year}`;
}
