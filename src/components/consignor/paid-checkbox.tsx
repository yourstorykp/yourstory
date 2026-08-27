"use client";

import { useOptimistic } from "react";
import { setConsignorPaidAction } from "@/app/consignor/actions";

export function PaidCheckbox({
  id,
  checked,
}: {
  id: number;
  checked: boolean;
}) {
  const [optimistic, setOptimistic] = useOptimistic(checked, (_prev, next: boolean) => next);

  return (
    <input
      type="checkbox"
      aria-label="Tandai lunas"
      checked={optimistic}
      onChange={async (e) => {
        const next = e.target.checked;
        setOptimistic(next);
        await setConsignorPaidAction(id, next);
      }}
      className="h-4 w-4 cursor-pointer rounded border-border accent-forest"
    />
  );
}
