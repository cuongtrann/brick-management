import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const orderId = searchParams.get("orderId");

  const payments = await prisma.payment.findMany({
    where: orderId ? { orderId: Number(orderId) } : {},
    orderBy: { paymentDate: "desc" },
  });
  return NextResponse.json(payments);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const payment = await prisma.payment.create({
    data: {
      orderId: body.orderId,
      paidAmount: body.paidAmount,
      paymentDate: new Date(body.paymentDate),
      note: body.note ?? null,
    },
  });
  return NextResponse.json(payment, { status: 201 });
}
