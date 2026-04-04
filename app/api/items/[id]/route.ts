import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const item = await prisma.item.findUnique({
    where: { id: Number(id) },
    include: { unitConversions: true },
  });
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(item);
}

export async function PUT(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const body = await req.json();
  const item = await prisma.item.update({
    where: { id: Number(id) },
    data: {
      name: body.name,
      baseUnit: body.baseUnit,
      allowCustomUnit: body.allowCustomUnit,
    },
    include: { unitConversions: true },
  });
  return NextResponse.json(item);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  await prisma.item.delete({ where: { id: Number(id) } });
  return new NextResponse(null, { status: 204 });
}
