import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const itemId = searchParams.get("itemId");

  const conversions = await prisma.unitConversion.findMany({
    where: itemId ? { itemId: Number(itemId) } : {},
    include: { item: { select: { name: true, baseUnit: true } } },
    orderBy: { unitName: "asc" },
  });
  return NextResponse.json(conversions);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const conv = await prisma.unitConversion.create({
    data: {
      itemId: body.itemId,
      unitName: body.unitName,
      conversionRate: body.conversionRate,
      minValue: body.minValue ?? null,
      maxValue: body.maxValue ?? null,
      pricePerBaseUnit: body.pricePerBaseUnit,
    },
    include: { item: { select: { name: true, baseUnit: true } } },
  });
  return NextResponse.json(conv, { status: 201 });
}
