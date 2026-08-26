"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  adminCreateBookingAction,
  type AdminBookingState,
} from "@/app/admin/bookings/actions";
import { formatRupiah } from "@/lib/format";

type ItemOption = {
  id: number;
  name: string;
  hargaSewa: number | string;
  stokTotal: number;
  satuanSewa: string;
};

type CustOption = { id: number; name: string; contact: string | null };

export function NewBookingForm({
  items,
  customers,
}: {
  items: ItemOption[];
  customers: CustOption[];
}) {
  const [state, formAction, pending] = useActionState<
    AdminBookingState,
    FormData
  >(adminCreateBookingAction, {});
  const [mode, setMode] = useState<"existing" | "new">("existing");
  const [rows, setRows] = useState<{ itemId: string; qty: string }[]>([
    { itemId: items[0]?.id ? String(items[0].id) : "", qty: "1" },
  ]);

  const addRow = () =>
    setRows([
      ...rows,
      { itemId: items[0]?.id ? String(items[0].id) : "", qty: "1" },
    ]);
  const removeRow = (i: number) => setRows(rows.filter((_, idx) => idx !== i));
  const setRow = (i: number, key: "itemId" | "qty", val: string) =>
    setRows(rows.map((r, idx) => (idx === i ? { ...r, [key]: val } : r)));

  const field =
    "h-9 w-full rounded-lg border border-input bg-card px-2 text-sm";

  return (
    <form
      action={formAction}
      className="space-y-4 rounded-xl border border-border bg-card p-4"
    >
      <div>
        <div className="mb-2 flex gap-2">
          <button
            type="button"
            onClick={() => setMode("existing")}
            className={
              "rounded-lg px-3 py-1.5 text-sm font-medium " +
              (mode === "existing"
                ? "bg-forest text-cream"
                : "bg-secondary text-foreground/80")
            }
          >
            Pelanggan lama
          </button>
          <button
            type="button"
            onClick={() => setMode("new")}
            className={
              "rounded-lg px-3 py-1.5 text-sm font-medium " +
              (mode === "new"
                ? "bg-forest text-cream"
                : "bg-secondary text-foreground/80")
            }
          >
            Pelanggan baru
          </button>
        </div>
        <input type="hidden" name="customerMode" value={mode} />
        {mode === "existing" ? (
          <select name="customerId" className={field} defaultValue="">
            <option value="" disabled>
              Pilih pelanggan…
            </option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.contact})
              </option>
            ))}
          </select>
        ) : (
          <div className="grid gap-2 sm:grid-cols-3">
            <input name="name" placeholder="Nama" className={field} />
            <input name="contact" placeholder="WhatsApp" className={field} />
            <input
              name="email"
              placeholder="Email (opsional)"
              className={field}
            />
          </div>
        )}
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Tgl sewa</label>
          <input type="date" name="startDate" required className={field} />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Tgl kembali</label>
          <input type="date" name="endDate" required className={field} />
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-sm font-medium">Barang</div>
        {rows.map((r, i) => (
          <div key={i} className="flex gap-2">
            <select
              name="itemId"
              value={r.itemId}
              onChange={(e) => setRow(i, "itemId", e.target.value)}
              className={"flex-1 " + field}
            >
              <option value="" disabled>
                Pilih barang…
              </option>
              {items.map((it) => (
                <option key={it.id} value={it.id}>
                  {it.name} — {formatRupiah(it.hargaSewa)}/{it.satuanSewa} (stok{" "}
                  {it.stokTotal})
                </option>
              ))}
            </select>
            <input
              name="qty"
              type="number"
              min={1}
              value={r.qty}
              onChange={(e) => setRow(i, "qty", e.target.value)}
              className={"w-20 " + field}
            />
            {rows.length > 1 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeRow(i)}
              >
                ✕
              </Button>
            )}
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={addRow}>
          + Barang lain
        </Button>
      </div>

      <textarea
        name="notes"
        placeholder="Catatan (opsional)"
        className="min-h-20 w-full rounded-lg border border-input bg-card px-2 py-1 text-sm"
      />

      {state.error && (
        <p className="text-sm text-destructive">{state.error}</p>
      )}

      <Button
        type="submit"
        disabled={pending}
        className="w-full bg-forest hover:bg-forest-deep"
      >
        {pending ? "Menyimpan…" : "Buat Booking"}
      </Button>
    </form>
  );
}
