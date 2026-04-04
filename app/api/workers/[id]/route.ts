import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const body = await req.json();

  try {
    const worker = await prisma.worker.update({
      where: { id: Number(id) },
      data: {
        name: body.name,
        type: body.type,
        phone: body.phone ?? null,
      },
    });
    return NextResponse.json(worker);
  } catch {
    return NextResponse.json({ error: "Lỗi khi cập nhật thông tin thợ." }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;

  try {
    const attendances = await prisma.workerAttendance.count({ where: { workerId: Number(id) } });
    const pieces = await prisma.workerPieceLog.count({ where: { workerId: Number(id) } });

    if (attendances > 0 || pieces > 0) {
      return NextResponse.json(
        { error: "Không thể xóa thợ đã có lịch sử làm việc." },
        { status: 400 }
      );
    }

    await prisma.worker.delete({ where: { id: Number(id) } });
    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json({ error: "Lỗi không xác định khi xóa thợ." }, { status: 500 });
  }
}
