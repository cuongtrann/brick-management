import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const customes = await prisma.customer.findMany({
    orderBy: { name: "asc" },
  });
  return NextResponse.json(customes);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  try {
    const customer = await prisma.customer.create({
      data: {
        name: body.name,
        phone: body.phone || null,
        address: body.address || null,
      },
    });
    return NextResponse.json(customer, { status: 201 });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: "Tên khách hàng đã tồn tại." },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
