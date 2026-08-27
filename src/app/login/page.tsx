"use client";

import { Suspense, useState } from "react";
import { LoginForm } from "@/components/admin/login-form";

export default function LoginPage() {
  const [role, setRole] = useState<"admin" | "consignor">("admin");

  return (
    <main className="topo-bg flex min-h-screen items-center justify-center px-4">
      <Suspense>
        <LoginForm role={role} onRoleChange={setRole} />
      </Suspense>
    </main>
  );
}
