"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ActionState } from "@/app/admin/actions";

type CatLike = { name?: string; description?: string | null };

export function CategoryForm({
  action,
  category,
  categoryId,
  title,
}: {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  category?: CatLike;
  categoryId?: number;
  title: string;
}) {
  const [state, formAction] = useActionState(action, {});
  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="font-heading text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          {categoryId ? <input type="hidden" name="id" value={categoryId} /> : null}
          <div className="space-y-2">
            <Label htmlFor="name">Nama Kategori *</Label>
            <Input id="name" name="name" defaultValue={category?.name ?? ""} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Deskripsi</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={category?.description ?? ""}
            />
          </div>
          {state.error && <p className="text-sm text-destructive">{state.error}</p>}
          <Button type="submit" className="bg-forest hover:bg-forest-deep">
            Simpan
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
