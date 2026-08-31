"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Trash2 } from "lucide-react";
import { clearConsignorMonthAction } from "@/app/admin/actions";

export function TitipSewaControls({
  consignors,
  months,
  current,
  currentMonth,
}: {
  consignors: { id: number; name: string }[];
  months: { value: string; label: string }[];
  current: number | null;
  currentMonth: string;
}) {
  const router = useRouter();
  const params = useSearchParams();

  const push = (c: string | null, m: string) => {
    const next = new URLSearchParams(params.toString());
    if (c) next.set("c", c);
    else next.delete("c");
    next.set("m", m);
    router.push(`/admin/titip-sewa?${next.toString()}`);
  };

  const [cy, cm] = currentMonth.split("-").map(Number);

  return (
    <div className="flex flex-wrap items-center gap-2 w-full">
      <Select
        value={current ? String(current) : ""}
        onValueChange={(v) => push(v, currentMonth)}
      >
        <SelectTrigger className="w-44">
          <SelectValue placeholder="Pilih penitip" />
        </SelectTrigger>
        <SelectContent>
          {consignors.map((c) => (
            <SelectItem key={c.id} value={String(c.id)}>
              {c.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={currentMonth}
        onValueChange={(v) => {
          if (!v) return;
          push(current ? String(current) : null, v);
        }}
      >
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Bulan" />
        </SelectTrigger>
        <SelectContent>
          {months.map((m) => (
            <SelectItem key={m.value} value={m.value}>
              {m.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button
        type="button"
        variant="destructive"
        size="icon"
        aria-label="Bersihkan riwayat bulan ini"
        title="Bersihkan riwayat bulan ini"
        disabled={!current}
        className="ml-auto"
        onClick={async () => {
          if (!current) return;
          if (
            !window.confirm(
              "Hapus semua riwayat sewa penitip ini pada bulan terpilih?"
            )
          )
            return;
          await clearConsignorMonthAction(current, cy, cm);
        }}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
