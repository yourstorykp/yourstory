"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

export function ConsignorSwitcher({
  consignors,
  current,
}: {
  consignors: { id: number; name: string }[];
  current: number | null;
}) {
  const router = useRouter();
  const params = useSearchParams();

  return (
    <Select
      value={current ? String(current) : ""}
      onValueChange={(v) => {
        if (!v) return;
        const next = new URLSearchParams(params.toString());
        next.set("c", v);
        router.push(`/admin/titip-sewa?${next.toString()}`);
      }}
    >
      <SelectTrigger className="w-64">
        <SelectValue placeholder="Pilih pemilik titipan" />
      </SelectTrigger>
      <SelectContent>
        {consignors.map((c) => (
          <SelectItem key={c.id} value={String(c.id)}>
            {c.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
