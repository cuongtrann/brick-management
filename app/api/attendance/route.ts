import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");
  const workerId = searchParams.get("workerId");

  const records = await prisma.workerAttendance.findMany({
    where: {
      ...(date ? { date: new Date(date) } : {}),
      ...(workerId ? { workerId: Number(workerId) } : {}),
    },
    include: { worker: { select: { name: true } } },
    orderBy: { date: "desc" },
  });
  return NextResponse.json(records);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const totalSalary =
    parseFloat(body.workingDay) * parseFloat(body.dailyRate);

  const record = await prisma.workerAttendance.upsert({
    where: {
      workerId_date: {
        workerId: body.workerId,
        date: new Date(body.date),
      },
    },
    update: {
      workingDay: body.workingDay,
      dailyRate: body.dailyRate,
      totalSalary,
      note: body.note ?? null,
    },
    create: {
      workerId: body.workerId,
      date: new Date(body.date),
      workingDay: body.workingDay,
      dailyRate: body.dailyRate,
      totalSalary,
      note: body.note ?? null,
    },
    include: { worker: { select: { name: true } } },
  });
  return NextResponse.json(record, { status: 201 });
}
