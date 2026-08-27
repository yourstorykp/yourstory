"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "./cart-context";
import { formatRupiah } from "@/lib/format";

function CartIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="22"
      height="22"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  );
}

export function CartWidget() {
  const { items, count, remove, setQty } = useCart();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-forest text-cream shadow-lg"
        aria-label="Buka keranjang"
      >
        <CartIcon />
        {count > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-terracotta px-1 text-xs font-bold text-white">
            {count}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setOpen(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto rounded-t-2xl bg-background p-4 sm:bottom-auto sm:right-4 sm:top-20 sm:max-w-md sm:rounded-2xl">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-heading text-lg font-semibold">Keranjang</h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Tutup"
                className="rounded-full p-2 text-muted-foreground hover:bg-muted"
              >
                ✕
              </button>
            </div>

            {items.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Keranjang masih kosong.
              </p>
            ) : (
              <>
                <ul className="space-y-2">
                  {items.map((it) => (
                    <li
                      key={it.itemId}
                      className="flex items-center gap-2 rounded-lg border border-border p-2"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium">
                          {it.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatRupiah(it.hargaSewa)}/{it.satuanSewa}
                        </div>
                      </div>
                      <input
                        type="number"
                        min={1}
                        max={it.stokTotal}
                        value={it.qty}
                        onChange={(e) =>
                          setQty(it.itemId, Number(e.target.value) || 1)
                        }
                        className="h-8 w-14 rounded-lg border border-input bg-card px-2 text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => remove(it.itemId)}
                        aria-label="Hapus"
                        className="rounded p-1 text-muted-foreground hover:text-destructive"
                      >
                        ✕
                      </button>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/sewa/cart"
                  onClick={() => setOpen(false)}
                  className="mt-3 block rounded-lg bg-forest px-3 py-2 text-center text-sm font-medium text-cream"
                >
                  Lanjut ke Booking ({count} item)
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
