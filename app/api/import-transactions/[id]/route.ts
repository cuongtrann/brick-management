import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  await prisma.importTransaction.delete({ where: { id: Number(id) } });
  return new NextResponse(null, { status: 204 });
}

export async function PUT(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const body = await req.json();

  const totalAmount = parseFloat(body.convertedQuantity) * parseFloat(body.price);

  const txn = await prisma.importTransaction.update({
    where: { id: Number(id) },
    data: {
      itemId: body.itemId,
      quantity: body.quantity,
      unitUsed: body.unitUsed,
      convertedQuantity: body.convertedQuantity,
      price: body.price,
      totalAmount,
      date: new Date(body.date),
      note: body.note ?? null,
    },
    include: { item: { select: { name: true, baseUnit: true } } },
  });
  return NextResponse.json(txn);
}
