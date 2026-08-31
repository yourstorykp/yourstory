import Link from "next/link";
import { db } from "@/lib/db";
import { items, customers, categories } from "@/db/schema";
import { AdminPOS } from "@/components/admin/pos/admin-pos";

export const dynamic = "force-dynamic";

export default async function NewBookingPage() {
  const [itemRows, customerRows, catRows] = await Promise.all([
    db
      .select({
        id: items.id,
        name: items.name,
        hargaSewa: items.hargaSewa,
        stokTotal: items.stokTotal,
        satuanSewa: items.satuanSewa,
        fotoUrl: items.fotoUrl,
        categoryId: items.categoryId,
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
    db.select({ id: categories.id, name: categories.name }).from(categories),
  ]);

  return (
    <div className="mx-auto flex h-full max-w-[1400px] flex-col space-y-4">
      <div>
        <Link
          href="/admin/bookings"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Kembali ke booking
        </Link>
        <h1 className="font-heading text-2xl font-semibold">Booking Baru (POS)</h1>
        <p className="text-sm text-muted-foreground">
          Pilih barang dari katalog untuk menambahkannya ke keranjang.
        </p>
      </div>
      
      <div className="flex-1">
        <AdminPOS items={itemRows} customers={customerRows} categories={catRows} />
      </div>
    </div>
  );
}
