import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/logo";

export default function HomePage() {
  return (
    <main className="topo-bg flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <Logo className="mb-6" />
      <h1 className="font-heading text-4xl font-semibold text-forest-deep sm:text-5xl">
        Manajemen Rental,
        <br />
        <span className="text-terracotta">tanpa ribet.</span>
      </h1>
      <p className="mt-4 max-w-md text-muted-foreground">
        yourstory.kp membantu kamu kelola inventaris, booking, dan barang titipan
        dalam satu sistem.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button render={<Link href="/sewa" />} className="bg-forest hover:bg-forest-deep">
          Lihat Katalog Sewa
        </Button>
        <Button render={<Link href="/admin" />} variant="outline">
          Masuk Admin
        </Button>
        <Button render={<Link href="/consignor/login" />} variant="outline">
          Pemilik Titipan
        </Button>
      </div>
    </main>
  );
}
