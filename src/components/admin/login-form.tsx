"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { loginAction } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Logo } from "@/components/brand/logo";

export function LoginForm({ role }: { role: "admin" | "consignor" }) {
  const [state, formAction] = useActionState(loginAction, {});
  const sp = useSearchParams();
  const next = sp.get("next") ?? "";

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
          <form action={formAction} className="space-y-4">
            <input type="hidden" name="role" value={role} />
            <input type="hidden" name="next" value={next} />
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required placeholder="admin@yourstory.kp" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required placeholder="••••••••" />
            </div>
            {state.error && (
              <p className="text-sm text-destructive">{state.error}</p>
            )}
            <Button type="submit" className="w-full bg-forest hover:bg-forest-deep">
              Masuk
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
