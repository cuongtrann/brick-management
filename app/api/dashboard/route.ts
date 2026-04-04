import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const dateParam = searchParams.get("date");
  
  let today;
  if (dateParam) {
    today = new Date(dateParam);
  } else {
    // Default to local offset midnight if no param
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    today = new Date(d.toISOString().split("T")[0]);
  }
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [
    totalImportToday,
    totalSalesToday,
    totalDebt,
    totalWorkerCostToday,
    recentOrders,
    recentImports,
  ] = await Promise.all([
    // Tổng nhập hàng hôm nay
    prisma.importTransaction.aggregate({
      where: { date: { gte: today, lt: tomorrow } },
      _sum: { totalAmount: true },
    }),
    // Tổng bán hàng hôm nay
    prisma.salesOrder.aggregate({
      where: { date: { gte: today, lt: tomorrow } },
      _sum: { totalAmount: true },
    }),
    // Tổng công nợ chưa trả
    prisma.salesOrder.findMany({
      where: { allowDebt: true },
      include: { payments: { select: { paidAmount: true } } },
    }),
    // Công thợ hôm nay
    Promise.all([
      prisma.workerAttendance.aggregate({
        where: { date: { gte: today, lt: tomorrow } },
        _sum: { totalSalary: true },
      }),
      prisma.workerPieceLog.aggregate({
        where: { date: { gte: today, lt: tomorrow } },
        _sum: { totalSalary: true },
      }),
    ]),
    // Đơn hàng gần đây
    prisma.salesOrder.findMany({
      take: 5,
      orderBy: { date: "desc" },
      include: { payments: { select: { paidAmount: true } } },
    }),
    // Nhập hàng gần đây
    prisma.importTransaction.findMany({
      take: 5,
      orderBy: { date: "desc" },
      include: { item: { select: { name: true } } },
    }),
  ]);

  // Tính tổng nợ
  const totalDebtAmount = totalDebt.reduce((sum: number, order: any) => {
    const paid = order.payments.reduce((s: number, p: any) => s + Number(p.paidAmount), 0);
    return sum + Math.max(0, Number(order.totalAmount) - paid);
  }, 0);

  const [attendanceCost, pieceCost] = totalWorkerCostToday;

  return NextResponse.json({
    totalImportToday: Number(totalImportToday._sum.totalAmount ?? 0),
    totalSalesToday: Number(totalSalesToday._sum.totalAmount ?? 0),
    totalDebt: totalDebtAmount,
    totalWorkerCostToday:
      Number(attendanceCost._sum.totalSalary ?? 0) +
      Number(pieceCost._sum.totalSalary ?? 0),
    recentOrders: recentOrders.map((o: any) => ({
      ...o,
      totalPaid: o.payments.reduce((s: number, p: any) => s + Number(p.paidAmount), 0),
      remaining:
        Number(o.totalAmount) -
        o.payments.reduce((s: number, p: any) => s + Number(p.paidAmount), 0),
    })),
    recentImports,
  });
}
