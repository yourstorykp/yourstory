"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/brand/logo";

export function LoginForm({
  role,
  onRoleChange,
}: {
  role: "admin" | "consignor";
  onRoleChange?: (r: "admin" | "consignor") => void;
}) {
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get("next") || (role === "consignor" ? "/consignor" : "/admin");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const isAdmin = role === "admin";

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setPending(true);
    const fd = new FormData(e.currentTarget);
    const res = await signIn("credentials", {
      email: fd.get("email") as string,
      password: fd.get("password") as string,
      role,
      redirect: false,
    });
    setPending(false);
    if (res?.error) {
      setError("Email atau password salah.");
      return;
    }
    router.push(next);
    router.refresh();
  }

  return (
    <div className="w-full max-w-md rounded-2xl border border-border bg-card/95 p-8 shadow-xl backdrop-blur">
      <div className="mb-6 flex flex-col items-center text-center">
        <Logo className="mb-3" />
        <h1 className="font-heading text-2xl font-semibold text-forest-deep">
          Masuk ke yourstory.kp
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {isAdmin
            ? "Kelola inventaris & rental"
            : "Pantau barang titipan & bagi hasil"}
        </p>
      </div>

      {onRoleChange && (
        <div className="mb-6 grid grid-cols-2 gap-1 rounded-full bg-muted p-1">
          <button
            type="button"
            onClick={() => onRoleChange("admin")}
            className={`rounded-full py-2 text-sm font-medium transition ${
              isAdmin
                ? "bg-forest text-cream shadow-sm"
                : "text-foreground hover:text-forest-deep"
            }`}
          >
            Admin
          </button>
          <button
            type="button"
            onClick={() => onRoleChange("consignor")}
            className={`rounded-full py-2 text-sm font-medium transition ${
              !isAdmin
                ? "bg-terracotta text-cream shadow-sm"
                : "text-foreground hover:text-terracotta-deep"
            }`}
          >
            Pemilik Titipan
          </button>
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="username"
            placeholder="admin@yourstory.kp"
            defaultValue={isAdmin ? "admin@yourstory.kp" : "consignor@yourstory.kp"}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            placeholder="••••••••"
          />
        </div>
        {error && (
          <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}
        <Button
          type="submit"
          className="h-11 w-full bg-forest text-cream hover:bg-forest-deep"
          disabled={pending}
        >
          {pending ? "Memproses…" : "Masuk"}
        </Button>
      </form>

      <p className="mt-5 text-center text-xs text-muted-foreground">
        Demo: {isAdmin ? "admin@yourstory.kp / admin1234" : "consignor@yourstory.kp / consignor1234"}
      </p>
    </div>
  );
}
