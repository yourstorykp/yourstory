"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ActionState } from "@/app/admin/actions";

type Cat = { id: number; name: string };
type Cons = { id: number; name: string };
type ItemLike = {
  id?: number;
  name?: string;
  sku?: string | null;
  categoryId?: number | null;
  description?: string | null;
  hargaSewa?: string | number;
  satuanSewa?: string;
  stokTotal?: number;
  maintenanceDays?: number;
  ownerType?: string;
  consignorId?: number | null;
  profitSharePct?: string | number;
  fotoUrl?: string | null;
  notes?: string | null;
};

export function ItemForm({
  action,
  categories,
  consignors,
  item,
}: {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  categories: Cat[];
  consignors: Cons[];
  item?: ItemLike;
}) {
  const [state, formAction] = useActionState(action, {});
  const [ownerType, setOwnerType] = useState(item?.ownerType ?? "store");
  const [categoryId, setCategoryId] = useState(
    item?.categoryId ? String(item.categoryId) : ""
  );
  const [satuanSewa, setSatuanSewa] = useState(item?.satuanSewa ?? "hari");
  const [consignorId, setConsignorId] = useState(
    item?.consignorId ? String(item.consignorId) : ""
  );

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="font-heading text-xl">
          {item?.id ? "Edit Barang" : "Tambah Barang"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Hidden inputs menjamin nilai select terkirim ke server action */}
        <form action={formAction} className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <input type="hidden" name="ownerType" value={ownerType} />
          <input type="hidden" name="categoryId" value={categoryId} />
          <input type="hidden" name="satuanSewa" value={satuanSewa} />
          <input type="hidden" name="consignorId" value={consignorId} />
          {item?.id ? <input type="hidden" name="id" value={item.id} /> : null}

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="name">Nama Barang *</Label>
            <Input id="name" name="name" defaultValue={item?.name ?? ""} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sku">SKU / Kode</Label>
            <Input id="sku" name="sku" defaultValue={item?.sku ?? ""} />
          </div>

          <div className="space-y-2">
            <Label>Kategori</Label>
            <Select value={categoryId} onValueChange={(v) => setCategoryId(v ?? "")}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">— Tanpa kategori —</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="hargaSewa">Harga Sewa (Rp)</Label>
            <Input
              id="hargaSewa"
              name="hargaSewa"
              type="number"
              min="0"
              defaultValue={item?.hargaSewa ?? 0}
            />
          </div>

          <div className="space-y-2">
            <Label>Satuan Sewa</Label>
            <Select value={satuanSewa} onValueChange={(v) => setSatuanSewa(v ?? "")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hari">per Hari</SelectItem>
                <SelectItem value="minggu">per Minggu</SelectItem>
                <SelectItem value="bulan">per Bulan</SelectItem>
                <SelectItem value="jam">per Jam</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="stokTotal">Stok Total</Label>
            <Input
              id="stokTotal"
              name="stokTotal"
              type="number"
              min="0"
              defaultValue={item?.stokTotal ?? 1}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="maintenanceDays">Hari Maintenance</Label>
            <Input
              id="maintenanceDays"
              name="maintenanceDays"
              type="number"
              min="0"
              defaultValue={item?.maintenanceDays ?? 0}
            />
          </div>

          <div className="space-y-2">
            <Label>Kepemilikan</Label>
            <Select value={ownerType} onValueChange={(v) => setOwnerType(v ?? "store")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="store">Milik Toko</SelectItem>
                <SelectItem value="consignor">Titipan (Consignor)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {ownerType === "consignor" && (
            <div className="space-y-2">
              <Label>Pemilik Titipan</Label>
              <Select value={consignorId} onValueChange={(v) => setConsignorId(v ?? "")}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih pemilik" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">— Pilih —</SelectItem>
                  {consignors.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {ownerType === "consignor" && (
            <div className="space-y-2">
              <Label htmlFor="profitSharePct">Bagi Hasil % (untuk pemilik)</Label>
              <Input
                id="profitSharePct"
                name="profitSharePct"
                type="number"
                min="0"
                max="100"
                defaultValue={item?.profitSharePct ?? 0}
              />
            </div>
          )}

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="fotoUrl">URL Foto</Label>
            <Input id="fotoUrl" name="fotoUrl" defaultValue={item?.fotoUrl ?? ""} placeholder="https://..." />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="description">Deskripsi</Label>
            <Textarea id="description" name="description" defaultValue={item?.description ?? ""} />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="notes">Catatan</Label>
            <Textarea id="notes" name="notes" defaultValue={item?.notes ?? ""} />
          </div>

          {state.error && (
            <p className="text-sm text-destructive md:col-span-2">{state.error}</p>
          )}

          <div className="md:col-span-2">
            <Button type="submit" className="bg-forest hover:bg-forest-deep">
              {item?.id ? "Simpan Perubahan" : "Tambah Barang"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
