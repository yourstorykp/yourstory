"use client";

import { logoutAction } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
  return (
    <form action={logoutAction}>
      <Button variant="ghost" size="sm" type="submit" className="text-muted-foreground">
        Keluar
      </Button>
    </form>
  );
}
