"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Logo } from "@/components/brand/logo";

export function LoginForm({ role }: { role: "admin" | "consignor" }) {
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get("next") || (role === "consignor" ? "/consignor" : "/admin");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

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
    <div className="flex min-h-screen items-center justify-center bg-background px-4 topo-bg">
      <Card className="w-full max-w-sm border-border shadow-sm">
        <CardHeader className="items-center text-center">
          <Logo />
          <CardTitle className="mt-4 font-heading text-2xl">
            {role === "consignor" ? "Masuk Pemilik Titipan" : "Masuk Admin"}
          </CardTitle>
          <CardDescription>
            {role === "consignor"
              ? "Pantau barang titipan & bagi hasil"
              : "Kelola inventaris & rental yourstory.kp"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                placeholder="admin@yourstory.kp"
                defaultValue="admin@yourstory.kp"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                placeholder="••••••••"
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button
              type="submit"
              className="w-full bg-forest hover:bg-forest-deep"
              disabled={pending}
            >
              {pending ? "Memproses…" : "Masuk"}
            </Button>
            {role === "admin" ? (
              <p className="text-center text-xs text-muted-foreground">
                Pemilik titipan?{" "}
                <a href="/consignor/login" className="text-terracotta hover:underline">
                  Masuk di sini
                </a>
              </p>
            ) : (
              <p className="text-center text-xs text-muted-foreground">
                Admin?{" "}
                <a href="/admin/login" className="text-terracotta hover:underline">
                  Masuk di sini
                </a>
              </p>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
