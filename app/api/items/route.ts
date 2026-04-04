import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const items = await prisma.item.findMany({
    include: { unitConversions: true },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const item = await prisma.item.create({
    data: {
      name: body.name,
      baseUnit: body.baseUnit,
      allowCustomUnit: body.allowCustomUnit ?? true,
    },
    include: { unitConversions: true },
  });
  return NextResponse.json(item, { status: 201 });
}
