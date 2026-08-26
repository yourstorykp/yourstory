"use client";

import { useState } from "react";
import { AdminNav } from "./admin-nav";
import { LogoutButton } from "./logout-button";

export function AdminMobileNav({ storeName }: { storeName: string }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <>
      <button
        type="button"
        aria-label="Buka menu"
        onClick={() => setOpen(true)}
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-xl leading-none text-foreground md:hidden"
      >
        &#9776;
      </button>

      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={close}
            aria-hidden
          />
          <div className="absolute left-0 top-0 flex h-full w-64 max-w-[82%] flex-col bg-card p-4">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm font-medium">{storeName}</span>
              <button
                type="button"
                aria-label="Tutup menu"
                onClick={close}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border text-base text-foreground"
              >
                &#10005;
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto">
              <AdminNav onNavigate={close} />
            </div>
            <div className="border-t border-border pt-3">
              <LogoutButton />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
