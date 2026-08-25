"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { BookingForm } from "@/components/sewa/booking-form";

export function BookingModal({
  item,
  dpPct,
}: {
  item: {
    id: number;
    hargaSewa: number | string;
    stokTotal: number;
    satuanSewa: string;
  };
  dpPct: number;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <Button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full bg-forest hover:bg-forest-deep"
      >
        Booking Sekarang
      </Button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-background p-5 sm:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-heading text-lg font-semibold">Form Booking</h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Tutup"
                className="rounded-full p-2 text-muted-foreground hover:bg-muted"
              >
                ✕
              </button>
            </div>
            <BookingForm item={item} dpPct={dpPct} />
          </div>
        </div>
      )}
    </>
  );
}
