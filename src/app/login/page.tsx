"use client";

import { Suspense, useState } from "react";
import { LoginForm } from "@/components/admin/login-form";

export default function LoginPage() {
  const [role, setRole] = useState<"admin" | "consignor">("admin");

  return (
    <main className="topo-bg flex min-h-screen flex-col items-center justify-center px-4">
      <div className="mb-5 flex gap-2">
        <button
          type="button"
          onClick={() => setRole("admin")}
          className={`rounded-full px-4 py-1.5 text-sm font-medium ${
            role === "admin"
              ? "bg-forest text-cream"
              : "border border-border bg-card text-foreground"
          }`}
        >
          Admin
        </button>
        <button
          type="button"
          onClick={() => setRole("consignor")}
          className={`rounded-full px-4 py-1.5 text-sm font-medium ${
            role === "consignor"
              ? "bg-forest text-cream"
              : "border border-border bg-card text-foreground"
          }`}
        >
          Pemilik Titipan
        </button>
      </div>
      <Suspense>
        <LoginForm role={role} />
      </Suspense>
    </main>
  );
}
