"use client";

import { Suspense } from "react";
import { LoginForm } from "@/components/admin/login-form";

export default function LoginPage() {
  return (
    <main className="topo-bg flex min-h-screen items-center justify-center px-4">
      <Suspense>
        <LoginForm role="admin" />
      </Suspense>
    </main>
  );
}
