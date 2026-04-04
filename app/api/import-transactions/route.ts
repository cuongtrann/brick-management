import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const itemId = searchParams.get("itemId");
  const limit = searchParams.get("limit");

  const txns = await prisma.importTransaction.findMany({
    where: itemId ? { itemId: Number(itemId) } : {},
    include: { item: { select: { name: true, baseUnit: true } } },
    orderBy: { date: "desc" },
    take: limit ? Number(limit) : undefined,
  });
  return NextResponse.json(txns);
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  const totalAmount =
    parseFloat(body.convertedQuantity) * parseFloat(body.price);

  const txn = await prisma.importTransaction.create({
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
  return NextResponse.json(txn, { status: 201 });
}
