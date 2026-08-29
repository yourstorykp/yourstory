import Link from "next/link";
import { CartCheckout } from "@/components/sewa/cart-checkout";

export const dynamic = "force-dynamic";

export default function CartCheckoutPage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <div className="rounded-2xl border border-border bg-card p-5 shadow-xl backdrop-blur-md">
        <Link
          href="/"
          className="inline-block mb-2 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          ← Kembali ke katalog
        </Link>
        <h1 className="font-heading text-2xl font-semibold text-forest-deep">
          Keranjang Booking
        </h1>
        <p className="mb-6 text-sm text-muted-foreground">
          Pilih tanggal sewa untuk semua barang, lalu kirim pesanan.
        </p>
        <CartCheckout />
      </div>
    </div>
  );
}
