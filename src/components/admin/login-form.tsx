"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/logo";
import { loginWithCredentials } from "@/app/login/actions";

export function LoginForm({ role }: { role: "admin" | "consignor" }) {
  const sp = useSearchParams();
  const next = sp.get("next") || "";
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const isAdmin = role === "admin";

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setPending(true);
    const fd = new FormData(e.currentTarget);
    fd.set("role", role);
    if (next) fd.set("next", next);
    const res = await loginWithCredentials(fd);
    setPending(false);
    if (res?.error) setError(res.error);
  }

  return (
    <div className="w-full max-w-md rounded-2xl border border-border bg-card/95 p-9 shadow-xl backdrop-blur">
      <div className="mb-7 flex flex-col items-center text-center">
        <Logo className="mb-4" />
        <h1 className="font-heading text-2xl font-semibold text-forest-deep">
          {isAdmin ? "Masuk Admin" : "Masuk Pemilik Titipan"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {isAdmin
            ? "Kelola inventaris & rental"
            : "Pantau barang titipan & bagi hasil"}
        </p>
      </div>

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

      <p className="mt-6 text-center text-sm text-muted-foreground">
        {isAdmin ? (
          <>
            Pemilik titipan?{" "}
            <a href="/login/consignor" className="font-medium text-terracotta hover:underline">
              Masuk di sini
            </a>
          </>
        ) : (
          <>
            Admin?{" "}
            <a href="/login/admin" className="font-medium text-terracotta hover:underline">
              Masuk di sini
            </a>
          </>
        )}
      </p>
    </div>
  );
}
