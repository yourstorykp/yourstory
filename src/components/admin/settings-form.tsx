"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageUploader } from "./image-uploader";
import type { ActionState } from "@/app/admin/actions";

type SetLike = {
  storeName?: string;
  currency?: string;
  defaultDpPct?: string | number;
  lateFeeRule?: string | null;
  backgroundUrl?: string | null;
};

export function SettingsForm({
  action,
  settings,
}: {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  settings?: SetLike;
}) {
  const [state, formAction] = useActionState(action, {});
  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="font-heading text-xl">Pengaturan Toko</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="storeName">Nama Toko</Label>
            <Input id="storeName" name="storeName" defaultValue={settings?.storeName ?? "yourstory.kp"} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="currency">Mata Uang</Label>
              <Input id="currency" name="currency" defaultValue={settings?.currency ?? "IDR"} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="defaultDpPct">DP Default (%)</Label>
              <Input
                id="defaultDpPct"
                name="defaultDpPct"
                type="number"
                min="0"
                max="100"
                defaultValue={settings?.defaultDpPct ?? 30}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="lateFeeRule">Aturan Denda Keterlambatan</Label>
            <Textarea
              id="lateFeeRule"
              name="lateFeeRule"
              defaultValue={settings?.lateFeeRule ?? ""}
              placeholder="Mis. 10% dari harga sewa per hari keterlambatan"
            />
          </div>
          
          <div className="space-y-2 border-t border-border pt-4 mt-4">
            <Label>Background Aplikasi (Semua Halaman)</Label>
            <input type="hidden" name="existingBackgroundUrl" value={settings?.backgroundUrl ?? ""} />
            <ImageUploader defaultPreview={settings?.backgroundUrl} />
          </div>
          {state.error && <p className="text-sm text-destructive">{state.error}</p>}
          {state.success && <p className="text-sm text-forest">Tersimpan.</p>}
          <Button type="submit" className="bg-forest hover:bg-forest-deep">
            Simpan Pengaturan
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
