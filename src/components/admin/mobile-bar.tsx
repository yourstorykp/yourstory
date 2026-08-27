"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  CalendarCheck,
  Users,
  BarChart3,
  Menu,
} from "lucide-react";
import { AdminNav } from "./admin-nav";
import { LogoutButton } from "./logout-button";
import { cn } from "@/lib/utils";

const primary = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/items", label: "Inventaris", icon: Package },
  { href: "/admin/bookings", label: "Booking", icon: CalendarCheck },
  { href: "/admin/titip-sewa", label: "Titip", icon: Users },
  { href: "/admin/laporan", label: "Laporan", icon: BarChart3 },
];

export function AdminMobileBar({ storeName }: { storeName: string }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div className="absolute left-0 top-0 flex h-full w-64 max-w-[82%] flex-col bg-card p-4">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm font-medium">{storeName}</span>
              <button
                type="button"
                aria-label="Tutup menu"
                onClick={() => setOpen(false)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border text-base text-foreground"
              >
                &#10005;
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto">
              <AdminNav onNavigate={() => setOpen(false)} />
            </div>
            <div className="border-t border-border pt-3">
              <LogoutButton />
            </div>
          </div>
        </div>
      )}

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur md:hidden">
        <div className="grid grid-cols-6">
          {primary.map((p) => (
            <Link
              key={p.href}
              href={p.href}
              className={cn(
                "flex flex-col items-center gap-0.5 py-2 text-[10px] font-medium",
                isActive(p.href, p.exact)
                  ? "text-forest"
                  : "text-muted-foreground"
              )}
            >
              <p.icon className="h-5 w-5" />
              {p.label}
            </Link>
          ))}
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="flex flex-col items-center gap-0.5 py-2 text-[10px] font-medium text-muted-foreground"
          >
            <Menu className="h-5 w-5" />
            Menu
          </button>
        </div>
      </nav>
    </>
  );
}
