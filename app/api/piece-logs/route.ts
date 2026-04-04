import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const workerId = searchParams.get("workerId");

  const logs = await prisma.workerPieceLog.findMany({
    where: workerId ? { workerId: Number(workerId) } : {},
    include: { worker: { select: { name: true } } },
    orderBy: { date: "desc" },
  });
  return NextResponse.json(logs);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const totalSalary =
    parseFloat(body.quantity) * parseFloat(body.pricePerUnit);

  const log = await prisma.workerPieceLog.create({
    data: {
      workerId: body.workerId,
      unit: body.unit,
      quantity: body.quantity,
      pricePerUnit: body.pricePerUnit,
      totalSalary,
      date: new Date(body.date),
      note: body.note ?? null,
    },
    include: { worker: { select: { name: true } } },
  });
  return NextResponse.json(log, { status: 201 });
}
