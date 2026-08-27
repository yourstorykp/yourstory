"use client";

import { useState } from "react";
import Link from "next/link";
import { formatRupiah, formatTanggal } from "@/lib/format";

const statusLabel: Record<string, string> = {
  booking: "Menunggu",
  confirmed: "Dikonfirmasi",
  active: "Disewa",
  returned: "Kembali",
  completed: "Selesai",
  cancelled: "Batal",
  late: "Terlambat",
};

function StatusBadge({ status }: { status: string }) {
  const tone =
    status === "cancelled"
      ? "bg-red-100 text-red-700"
      : status === "completed" || status === "returned"
        ? "bg-forest/15 text-forest-deep"
        : status === "active" || status === "late"
          ? "bg-terracotta/15 text-terracotta-deep"
          : "bg-amber-100 text-amber-700";
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-medium ${tone}`}
    >
      {statusLabel[status] ?? status}
    </span>
  );
}

export type BookingRow = {
  code: string;
  id: number;
  status: string;
  customerName: string | null;
  contact: string | null;
  items: { name: string | null; qty: number }[];
  startDate: string;
  endDate: string;
  total: string;
  dpAmount: string;
};

export function BookingsList({ rows }: { rows: BookingRow[] }) {
  const [openId, setOpenId] = useState<number | null>(null);

  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card px-4 py-10 text-center text-sm text-muted-foreground">
        Belum ada booking masuk.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {rows.map((b) => {
        const open = openId === b.id;
        return (
          <div
            key={b.id}
            className="overflow-hidden rounded-xl border border-border bg-card"
          >
            <button
              type="button"
              onClick={() => setOpenId(open ? null : b.id)}
              className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
            >
              <div className="min-w-0">
                <div className="font-medium">{b.code}</div>
                <div className="truncate text-sm">{b.customerName ?? "—"}</div>
                <div className="text-xs text-muted-foreground">
                  {b.contact ?? "—"}
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <StatusBadge status={b.status} />
                <span className="text-muted-foreground">{open ? "▴" : "▾"}</span>
              </div>
            </button>

            {open && (
              <div className="space-y-3 border-t border-border px-4 py-3 text-sm">
                <div>
                  <div className="mb-1 text-xs text-muted-foreground">Barang</div>
                  <ul className="space-y-1">
                    {b.items.map((it, i) => (
                      <li key={i} className="flex justify-between gap-2">
                        <span className="truncate">{it.name ?? "?"}</span>
                        <span className="shrink-0 text-muted-foreground">
                          ×{it.qty}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <div className="mb-1 text-xs text-muted-foreground">
                    Tanggal Sewa
                  </div>
                  <div>
                    {formatTanggal(b.startDate)} s.d. {formatTanggal(b.endDate)}
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total</span>
                  <span className="font-medium">{formatRupiah(b.total)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">DP</span>
                  <span className="font-medium text-terracotta-deep">
                    {formatRupiah(b.dpAmount)}
                  </span>
                </div>
                <div className="flex gap-2 pt-1">
                  <Link
                    href={`/admin/bookings/${b.id}`}
                    className="flex-1 rounded-lg bg-forest px-3 py-2 text-center text-sm font-medium text-cream"
                  >
                    Buka
                  </Link>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
