"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/items", label: "Inventaris" },
  { href: "/admin/bookings", label: "Booking" },
  { href: "/admin/laporan", label: "Laporan" },
  { href: "/admin/customers", label: "Pelanggan" },
  { href: "/admin/categories", label: "Kategori" },
  { href: "/admin/settings", label: "Pengaturan" },
];

export function AdminNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-1">
      {links.map((l) => {
        const active =
          l.href === "/admin" ? pathname === "/admin" : pathname.startsWith(l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            onClick={onNavigate}
            className={cn(
              "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-forest text-cream"
                : "text-foreground/80 hover:bg-secondary"
            )}
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
