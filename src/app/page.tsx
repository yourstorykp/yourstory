"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/brand/logo";

export default function SplashPage() {
  const router = useRouter();
  useEffect(() => {
    const t = setTimeout(() => router.replace("/sewa"), 2500);
    return () => clearTimeout(t);
  }, [router]);

  return (
    <>
      <meta httpEquiv="refresh" content="3;url=/sewa" />
      <main className="topo-bg flex min-h-screen flex-col items-center justify-center px-4 text-center">
        <Logo className="mb-6" />
        <h1 className="font-heading text-4xl font-semibold text-forest-deep sm:text-5xl">
          Manajemen Rental,
          <br />
          <span className="text-terracotta">tanpa ribet.</span>
        </h1>
        <p className="mt-4 max-w-md text-muted-foreground">
          yourstory.kp membantu kamu kelola inventaris, booking, dan barang
          titipan dalam satu sistem.
        </p>
        <p className="mt-6 text-xs text-muted-foreground">
          Mengalihkan ke katalog…
        </p>
      </main>
    </>
  );
}
