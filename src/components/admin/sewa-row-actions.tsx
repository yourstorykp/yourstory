"use client";

import { useState, type FormEvent } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pencil, Trash2 } from "lucide-react";
import {
  updateBookingItemAction,
  deleteBookingItemAction,
  type ActionState,
} from "@/app/admin/actions";

export function SewaRowActions({
  id,
  subtotal,
}: {
  id: number;
  subtotal: string | number | null;
}) {
  const [open, setOpen] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleEdit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setBusy(true);
    setErr(null);
    const res = await updateBookingItemAction({} as ActionState, fd);
    setBusy(false);
    if (res?.error) {
      setErr(res.error);
      return;
    }
    setOpen(false);
  };

  return (
    <div className="flex items-center justify-center gap-0.5">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger
          render={
            <Button variant="ghost" size="icon" aria-label="Edit">
              <Pencil className="h-4 w-4" />
            </Button>
          }
        />
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Harga Sewa</DialogTitle>
            <DialogDescription>
              Perbarui nominal sewa untuk baris ini.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-3">
            <input type="hidden" name="id" value={id} />
            <div className="space-y-2">
              <Label htmlFor="subtotal">Harga (Subtotal)</Label>
              <Input
                id="subtotal"
                name="subtotal"
                type="number"
                defaultValue={Number(subtotal || 0)}
              />
            </div>
            {err && <p className="text-sm text-destructive">{err}</p>}
            <div className="flex justify-end gap-2">
              <DialogClose
                render={
                  <Button variant="outline" type="button">
                    Batal
                  </Button>
                }
              />
              <Button type="submit" className="bg-forest hover:bg-forest-deep" disabled={busy}>
                Simpan
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Button
        variant="ghost"
        size="icon"
        aria-label="Hapus"
        onClick={async () => {
          if (!window.confirm("Hapus baris riwayat ini?")) return;
          await deleteBookingItemAction(id);
        }}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
