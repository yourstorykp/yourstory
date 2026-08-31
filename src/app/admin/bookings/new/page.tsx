import Link from "next/link";
import { db } from "@/lib/db";
import { items, customers } from "@/db/schema";
import { NewBookingForm } from "@/components/admin/new-booking-form";

export const dynamic = "force-dynamic";

export default async function NewBookingPage() {
  const [itemRows, customerRows] = await Promise.all([
    db
      .select({
        id: items.id,
        name: items.name,
        hargaSewa: items.hargaSewa,
        stokTotal: items.stokTotal,
        satuanSewa: items.satuanSewa,
        fotoUrl: items.fotoUrl,
      })
      .from(items)
      .orderBy(items.name),
    db
      .select({
        id: customers.id,
        name: customers.name,
        contact: customers.contact,
      })
      .from(customers)
      .orderBy(customers.name),
  ]);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link
          href="/admin/bookings"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Kembali ke booking
        </Link>
        <h1 className="font-heading text-2xl font-semibold">Booking Baru</h1>
        <p className="text-sm text-muted-foreground">
          Buat pesanan manual untuk pelanggan.
        </p>
      </div>
      <NewBookingForm items={itemRows} customers={customerRows} />
    </div>
  );
}
