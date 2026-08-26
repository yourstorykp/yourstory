import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { bookings } from "@/db/schema";
import { desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

function csvCell(v: string): string {
  if (/[",\n\r]/.test(v)) return '"' + v.replace(/"/g, '""') + '"';
  return v;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from") ?? "";
  const to = searchParams.get("to") ?? "";

  const all = await db.query.bookings.findMany({
    with: { customer: true, payments: true },
    orderBy: (b, { desc }) => [desc(b.startDate)],
  });

  const rows = all.filter((b) => b.startDate <= to && b.endDate >= from);

  const header = [
    "Kode",
    "Pelanggan",
    "Kontak",
    "Mulai",
    "Selesai",
    "Status",
    "Total",
    "DP",
    "DP_Lunas",
    "Dibayar",
    "Sisa",
  ];
  const lines = [header.map(csvCell).join(",")];

  for (const b of rows) {
    const total = Number(b.total) || 0;
    const paid = (b.payments || []).reduce(
      (s, p) => s + (Number(p.amount) || 0),
      0,
    );
    const sisa = Math.max(0, total - paid);
    const row = [
      `YS-${b.id}-${new Date(b.createdAt).getFullYear()}`,
      b.customer?.name ?? "",
      b.customer?.contact ?? "",
      b.startDate,
      b.endDate,
      b.status,
      String(total),
      String(Number(b.dpAmount) || 0),
      b.dpPaid ? "ya" : "tidak",
      String(paid),
      String(sisa),
    ];
    lines.push(row.map(csvCell).join(","));
  }

  const csv = "﻿" + lines.join("\r\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="laporan-${from}_${to}.csv"`,
    },
  });
}
