"use client";

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ConsignorForm } from "@/components/admin/consignor-form";
import { createConsignorAction } from "@/app/admin/actions";

export function ConsignorDialog() {
  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button className="bg-forest hover:bg-forest-deep">
            Tambah Pemilik Titipan
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tambah Pemilik Titipan</DialogTitle>
          <DialogDescription>
            Buat akun pemilik titipan (penitip) dengan nama, email, dan password.
          </DialogDescription>
        </DialogHeader>
        <ConsignorForm action={createConsignorAction} />
      </DialogContent>
    </Dialog>
  );
}
