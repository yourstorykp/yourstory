import Link from "next/link";
import { CartCheckout } from "@/components/sewa/cart-checkout";

export const dynamic = "force-dynamic";

export default function CartCheckoutPage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <Link
        href="/sewa"
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        ← Kembali ke katalog
      </Link>
      <h1 className="mt-2 font-heading text-2xl font-semibold text-forest-deep">
        Booking Keranjang
      </h1>
      <p className="mb-4 text-sm text-muted-foreground">
        Pilih tanggal sewa untuk semua barang, lalu kirim pesanan.
      </p>
      <CartCheckout />
    </div>
  );
}
