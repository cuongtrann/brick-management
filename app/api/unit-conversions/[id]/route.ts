import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const body = await req.json();
  const conv = await prisma.unitConversion.update({
    where: { id: Number(id) },
    data: {
      unitName: body.unitName,
      conversionRate: body.conversionRate,
      minValue: body.minValue ?? null,
      maxValue: body.maxValue ?? null,
      pricePerBaseUnit: body.pricePerBaseUnit,
    },
  });
  return NextResponse.json(conv);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  await prisma.unitConversion.delete({ where: { id: Number(id) } });
  return new NextResponse(null, { status: 204 });
}
