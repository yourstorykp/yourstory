import { PosCartItem } from "./admin-pos";
import { formatRupiah } from "@/lib/format";

export function PosCart({
  cart,
  onUpdateQty,
  isCheckoutView,
}: {
  cart: PosCartItem[];
  onUpdateQty: (id: number, delta: number) => void;
  onCheckout: () => void;
  isCheckoutView: boolean;
}) {
  return (
    <>
      {cart.length === 0 ? (
        <div className="flex h-full flex-col items-center justify-center text-center text-sm text-muted-foreground py-10">
          Keranjang kosong. <br /> Pilih barang dari katalog.
        </div>
      ) : (
        <ul className="space-y-4">
          {cart.map((it) => (
            <li key={it.id} className="flex gap-3">
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-md bg-muted">
                {it.fotoUrl ? (
                  <img src={it.fotoUrl} alt={it.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[10px] text-muted-foreground">No Photo</div>
                )}
              </div>
              <div className="flex flex-1 flex-col">
                <span className="line-clamp-1 text-sm font-medium">{it.name}</span>
                <span className="text-xs text-muted-foreground">
                  {formatRupiah(it.hargaSewa)}
                </span>
                {!isCheckoutView && (
                  <div className="mt-2 flex items-center gap-3">
                    <button
                      type="button"
                      className="flex h-6 w-6 items-center justify-center rounded-full border border-border bg-background transition-transform active:scale-90"
                      onClick={() => onUpdateQty(it.id, -1)}
                    >
                      -
                    </button>
                    <span className="text-sm font-medium">{it.qty}</span>
                    <button
                      type="button"
                      className="flex h-6 w-6 items-center justify-center rounded-full border border-border bg-background transition-transform active:scale-90 disabled:opacity-50"
                      onClick={() => onUpdateQty(it.id, 1)}
                      disabled={it.qty >= it.stokTotal}
                    >
                      +
                    </button>
                  </div>
                )}
                {isCheckoutView && (
                  <div className="mt-1 text-sm">Qty: {it.qty}</div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
