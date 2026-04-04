import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");

  const workers = await prisma.worker.findMany({
    where: type ? { type: type as "DAILY" | "PIECE" } : {},
    orderBy: { name: "asc" },
  });
  return NextResponse.json(workers);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const worker = await prisma.worker.create({
    data: {
      name: body.name,
      type: body.type,
      phone: body.phone ?? null,
    },
  });
  return NextResponse.json(worker, { status: 201 });
}
