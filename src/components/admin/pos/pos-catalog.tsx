import { useState } from "react";
import { AdminPosItem } from "./admin-pos";
import { formatRupiah } from "@/lib/format";
import { Search } from "lucide-react";

export function PosCatalog({
  items,
  categories,
  onAdd,
}: {
  items: AdminPosItem[];
  categories: { id: number; name: string }[];
  onAdd: (item: AdminPosItem) => void;
}) {
  const [q, setQ] = useState("");
  const [catId, setCatId] = useState<number | null>(null);

  const filtered = items.filter((it) => {
    if (catId && it.categoryId !== catId) return false;
    if (q && !it.name.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="flex h-full flex-col">
      <div className="sticky top-0 z-10 border-b border-border bg-card p-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Cari barang..."
              className="h-10 w-full rounded-lg border border-input bg-background pl-9 pr-4 text-sm"
            />
          </div>
          <div className="flex shrink-0 gap-2 overflow-x-auto pb-1 sm:pb-0">
            <button
              type="button"
              onClick={() => setCatId(null)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors whitespace-nowrap ${
                catId === null ? "bg-forest text-white" : "bg-muted text-muted-foreground hover:bg-secondary"
              }`}
            >
              Semua
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setCatId(c.id)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors whitespace-nowrap ${
                  catId === c.id ? "bg-forest text-white" : "bg-muted text-muted-foreground hover:bg-secondary"
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((it) => (
            <button
              key={it.id}
              onClick={() => onAdd(it)}
              className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-background text-left transition-all hover:border-forest hover:shadow-md"
            >
              <div className="aspect-square w-full overflow-hidden bg-muted">
                {it.fotoUrl ? (
                  <img src={it.fotoUrl} alt={it.name} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">No Photo</div>
                )}
              </div>
              <div className="flex flex-1 flex-col p-3">
                <span className="line-clamp-2 text-sm font-medium">{it.name}</span>
                <span className="mt-1 text-xs text-forest font-medium">
                  {formatRupiah(it.hargaSewa)}/{it.satuanSewa}
                </span>
                <span className="mt-1 text-xs text-muted-foreground">Stok: {it.stokTotal}</span>
              </div>
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full py-12 text-center text-sm text-muted-foreground">
              Tidak ada barang ditemukan.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
