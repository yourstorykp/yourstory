import { useState, useActionState } from "react";
import { AdminPosCustomer, PosCartItem } from "./admin-pos";
import { adminCreateBookingAction, type AdminBookingState } from "@/app/admin/bookings/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function PosCheckoutForm({
  cart,
  customers,
  onBack,
  onSuccess,
}: {
  cart: PosCartItem[];
  customers: AdminPosCustomer[];
  onBack: () => void;
  onSuccess: () => void;
}) {
  const [state, formAction, pending] = useActionState<AdminBookingState, FormData>(adminCreateBookingAction, {});
  const [custMode, setCustMode] = useState<"existing" | "new">("existing");

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border p-4 flex items-center gap-4 sticky top-0 bg-card z-10">
        <button onClick={onBack} className="text-muted-foreground hover:text-foreground text-sm font-medium">
          ← Kembali
        </button>
        <h2 className="font-heading text-lg font-semibold">Selesaikan Pesanan</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <form action={formAction} className="mx-auto max-w-xl space-y-6">
          {/* Hidden inputs to pass cart data to server action */}
          {cart.map((it) => (
            <div key={it.id}>
              <input type="hidden" name="itemId" value={it.id} />
              <input type="hidden" name="qty" value={it.qty} />
            </div>
          ))}

          <div className="space-y-4 rounded-xl border border-border bg-background p-4">
            <div className="flex gap-2 rounded-lg bg-muted p-1">
              <button
                type="button"
                onClick={() => setCustMode("existing")}
                className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  custMode === "existing" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Pelanggan lama
              </button>
              <button
                type="button"
                onClick={() => setCustMode("new")}
                className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  custMode === "new" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Pelanggan baru
              </button>
            </div>

            <input type="hidden" name="customerMode" value={custMode} />

            {custMode === "existing" ? (
              <div className="space-y-2">
                <Label htmlFor="customerId">Pilih Pelanggan</Label>
                <select
                  name="customerId"
                  id="customerId"
                  className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  required
                >
                  <option value="">-- Pilih --</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.contact ? `(${c.contact})` : ""}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Nama *</Label>
                  <Input id="name" name="name" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact">WhatsApp *</Label>
                  <Input id="contact" name="contact" required />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="email">Email (opsional)</Label>
                  <Input id="email" name="email" type="email" />
                </div>
              </div>
            )}
          </div>

          <div className="grid gap-4 rounded-xl border border-border bg-background p-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="startDate">Tanggal Sewa *</Label>
              <Input type="date" id="startDate" name="startDate" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">Tanggal Kembali *</Label>
              <Input type="date" id="endDate" name="endDate" required />
            </div>
          </div>

          <div className="space-y-2 rounded-xl border border-border bg-background p-4">
            <Label htmlFor="notes">Catatan (opsional)</Label>
            <Textarea id="notes" name="notes" rows={3} />
          </div>

          {state?.error && (
            <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {state.error}
            </p>
          )}

          <Button type="submit" className="w-full bg-forest hover:bg-forest-deep" disabled={pending || cart.length === 0}>
            {pending ? "Memproses..." : "Buat Booking"}
          </Button>
        </form>
      </div>
    </div>
  );
}
