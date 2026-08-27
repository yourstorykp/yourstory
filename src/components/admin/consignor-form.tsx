"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ActionState } from "@/app/admin/actions";

export function ConsignorForm({
  action,
}: {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
}) {
  const [state, formAction] = useActionState(action, {});

  return (
    <form action={formAction} className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div className="space-y-2">
        <Label htmlFor="name">Nama Pemilik *</Label>
        <Input id="name" name="name" required placeholder="Toko Sejahtera" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email / Username *</Label>
        <Input id="email" name="email" type="email" required placeholder="pemilik@email.com" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password *</Label>
        <Input id="password" name="password" type="password" required minLength={6} placeholder="••••••••" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="contact">Kontak</Label>
        <Input id="contact" name="contact" placeholder="0812..." />
      </div>

      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="notes">Catatan</Label>
        <Textarea id="notes" name="notes" />
      </div>

      {state.error && (
        <p className="text-sm text-destructive md:col-span-2">{state.error}</p>
      )}

      <div className="md:col-span-2">
        <Button type="submit" className="bg-forest hover:bg-forest-deep">
          Tambah Pemilik Titipan
        </Button>
      </div>
    </form>
  );
}
