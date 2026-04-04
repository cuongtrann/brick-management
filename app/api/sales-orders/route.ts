import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const limit = searchParams.get("limit");

  const orders = await prisma.salesOrder.findMany({
    include: { payments: true },
    orderBy: { date: "desc" },
    take: limit ? Number(limit) : undefined,
  });

  const ordersWithDebt = orders.map((order: any) => {
    const totalPaid = order.payments.reduce(
      (sum: number, p: any) => sum + Number(p.paidAmount),
      0
    );
    return {
      ...order,
      totalPaid,
      remaining: Number(order.totalAmount) - totalPaid,
    };
  });

  return NextResponse.json(ordersWithDebt);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const totalAmount =
    parseFloat(body.totalQuantity) * parseFloat(body.pricePerUnit);

  let custName = body.customerName;
  if (body.customerId) {
    const c = await prisma.customer.findUnique({ where: { id: Number(body.customerId) } });
    if (c) custName = c.name;
  }

  const order = await prisma.salesOrder.create({
    data: {
      customerId: body.customerId ? Number(body.customerId) : null,
      customerName: custName,
      totalQuantity: body.totalQuantity,
      pricePerUnit: body.pricePerUnit,
      totalAmount,
      date: new Date(body.date),
      allowDebt: body.allowDebt ?? false,
      note: body.note ?? null,
    },
    include: { payments: true },
  });
  return NextResponse.json(
    { ...order, totalPaid: 0, remaining: Number(order.totalAmount) },
    { status: 201 }
  );
}
