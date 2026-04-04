import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const body = await req.json();

  try {
    const customer = await prisma.customer.update({
      where: { id: Number(id) },
      data: {
        name: body.name,
        phone: body.phone || null,
        address: body.address || null,
      },
    });
    return NextResponse.json(customer);
  } catch (err: unknown) {
    if (typeof err === "object" && err !== null && "code" in err && (err as { code: string }).code === "P2002") {
      return NextResponse.json({ error: "Tên khách hàng đã tồn tại." }, { status: 400 });
    }
    return NextResponse.json({ error: "Lỗi server." }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;

  try {
    const ordersCount = await prisma.salesOrder.count({ where: { customerId: Number(id) } });
    if (ordersCount > 0) {
      return NextResponse.json({ error: "Không thể xóa khách hàng đã có đơn hàng." }, { status: 400 });
    }

    await prisma.customer.delete({ where: { id: Number(id) } });
    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json({ error: "Lỗi khi xóa khách hàng." }, { status: 500 });
  }
}
