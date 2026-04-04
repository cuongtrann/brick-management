import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const order = await prisma.salesOrder.findUnique({
    where: { id: Number(id) },
    include: { payments: { orderBy: { paymentDate: "asc" } }, customer: true },
  });
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const totalPaid = order.payments.reduce(
    (sum, p) => sum + Number(p.paidAmount),
    0
  );
  return NextResponse.json({
    ...order,
    totalPaid,
    remaining: Number(order.totalAmount) - totalPaid,
  });
}

export async function PUT(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const body = await req.json();
  const totalAmount =
    parseFloat(body.totalQuantity) * parseFloat(body.pricePerUnit);

  const order = await prisma.salesOrder.update({
    where: { id: Number(id) },
    data: {
      customerName: body.customerName,
      totalQuantity: body.totalQuantity,
      pricePerUnit: body.pricePerUnit,
      totalAmount,
      date: new Date(body.date),
      allowDebt: body.allowDebt,
      note: body.note ?? null,
    },
    include: { payments: true },
  });
  const totalPaid = order.payments.reduce(
    (sum, p) => sum + Number(p.paidAmount),
    0
  );
  return NextResponse.json({
    ...order,
    totalPaid,
    remaining: Number(order.totalAmount) - totalPaid,
  });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  await prisma.salesOrder.delete({ where: { id: Number(id) } });
  return new NextResponse(null, { status: 204 });
}
