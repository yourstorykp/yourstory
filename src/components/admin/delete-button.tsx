"use client";

import { Button } from "@/components/ui/button";

export function DeleteButton({
  action,
}: {
  action: (formData: FormData) => void;
}) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm("Yakin ingin menghapus?")) e.preventDefault();
      }}
    >
      <Button variant="ghost" size="sm" type="submit" className="text-destructive">
        Hapus
      </Button>
    </form>
  );
}
