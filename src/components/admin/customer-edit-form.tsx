"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { updateCustomerAction } from "@/app/admin/actions";
import Link from "next/link";

type Customer = {
  id: number;
  name: string;
  contact: string | null;
  email: string | null;
  blacklist: boolean;
};

export function CustomerEditForm({ customer }: { customer: Customer }) {
  const [state, formAction] = useActionState(updateCustomerAction, {});

  return (
    <Card className="border-border">
      <CardContent className="pt-6">
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="id" value={customer.id} />
          
          <div className="space-y-2">
            <Label htmlFor="name">Nama Lengkap</Label>
            <Input id="name" name="name" defaultValue={customer.name} required />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="contact">Nomor WhatsApp / Kontak</Label>
            <Input id="contact" name="contact" defaultValue={customer.contact ?? ""} required />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email (Opsional)</Label>
            <Input id="email" name="email" type="email" defaultValue={customer.email || ""} />
          </div>

          {state.error && <p className="text-sm text-destructive">{state.error}</p>}
          
          <div className="flex justify-end gap-3 pt-4">
            <Button render={<Link href="/admin/customers" />} variant="outline">
              Batal
            </Button>
            <Button type="submit" className="bg-forest hover:bg-forest-deep">
              Simpan Perubahan
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
