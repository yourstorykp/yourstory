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
  fotoUrl?: string | null;
};

type CustOption = { id: number; name: string; contact: string | null };

const field = "h-9 w-full rounded-lg border border-input bg-card px-2 text-sm";

function ItemCombobox({
  items,
  value,
  onChange,
}: {
  items: ItemOption[];
  value: string;
  onChange: (id: string) => void;
}) {
  const selected = items.find((i) => String(i.id) === value);
  const [q, setQ] = useState(selected?.name ?? "");
  const [open, setOpen] = useState(false);
  const filtered = q
    ? items.filter((i) => i.name.toLowerCase().includes(q.toLowerCase()))
    : items;

  return (
    <div className="relative min-w-0 flex-1">
      <input
        value={q}
        placeholder="Ketik nama barang (Search)..."
        className={field}
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(true);
          if (!items.some((i) => i.name === e.target.value)) onChange("");
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
      />
      {open && (
        <ul className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-border bg-card py-1 shadow-lg">
          {filtered.length === 0 ? (
            <li className="px-3 py-2 text-xs text-muted-foreground">
              Tidak ada barang cocok
            </li>
          ) : (
            filtered.map((it) => (
              <li key={it.id}>
                <button
                  type="button"
                  className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-secondary"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    setQ(it.name);
                    onChange(String(it.id));
                    setOpen(false);
                  }}
                >
                  <div className="h-10 w-10 shrink-0 overflow-hidden rounded-md border border-border bg-muted">
                    {it.fotoUrl ? (
                      <img
                        src={it.fotoUrl}
                        alt={it.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[10px] text-muted-foreground">
                        No Pic
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col overflow-hidden">
                    <span className="truncate text-sm font-medium">{it.name}</span>
                    <span className="truncate text-xs text-muted-foreground">
                      {formatRupiah(it.hargaSewa)}/{it.satuanSewa} (stok: {it.stokTotal})
                    </span>
                  </div>
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}

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
  const [rows, setRows] = useState<{ id: string; itemId: string; qty: string }[]>([
    {
      id: crypto.randomUUID(),
      itemId: items[0]?.id ? String(items[0].id) : "",
      qty: "1",
    },
  ]);

  const addRow = () =>
    setRows([
      ...rows,
      {
        id: crypto.randomUUID(),
        itemId: items[0]?.id ? String(items[0].id) : "",
        qty: "1",
      },
    ]);
  const removeRow = (i: number) => setRows(rows.filter((_, idx) => idx !== i));
  const setRow = (i: number, key: "itemId" | "qty", val: string) =>
    setRows(rows.map((r, idx) => (idx === i ? { ...r, [key]: val } : r)));

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
          <div key={r.id} className="flex gap-2">
            <ItemCombobox
              items={items}
              value={r.itemId}
              onChange={(id) => setRow(i, "itemId", id)}
            />
            <input type="hidden" name="itemId" value={r.itemId} />
            <input
              name="qty"
              type="number"
              min={1}
              value={r.qty}
              onChange={(e) => setRow(i, "qty", e.target.value)}
              className={"w-16 " + field}
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
