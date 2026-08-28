"use client";

import { useState } from "react";
import imageCompression from "browser-image-compression";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ImageUploader({ defaultPreview }: { defaultPreview?: string | null }) {
  const [preview, setPreview] = useState<string | null>(defaultPreview || null);
  const [base64, setBase64] = useState<string>("");
  const [isCompressing, setIsCompressing] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setPreview(defaultPreview || null);
      setBase64("");
      return;
    }

    try {
      setIsCompressing(true);
      
      // Compress if larger than 1MB
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1200,
        useWebWorker: true,
      };
      
      const compressedFile = await imageCompression(file, options);
      
      // Convert to base64
      const reader = new FileReader();
      reader.readAsDataURL(compressedFile);
      reader.onloadend = () => {
        const base64data = reader.result as string;
        setPreview(base64data);
        setBase64(base64data);
        setIsCompressing(false);
      };
    } catch (error) {
      console.error("Error compressing image:", error);
      setIsCompressing(false);
    }
  };

  return (
    <div className="space-y-4 rounded-lg border border-border p-4">
      <div className="space-y-2">
        <Label htmlFor="imageUpload">Foto Barang</Label>
        <Input
          id="imageUpload"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={isCompressing}
        />
        <p className="text-xs text-muted-foreground">
          {isCompressing 
            ? "Sedang memproses gambar..." 
            : "Pilih foto dari perangkat Anda. Akan otomatis dikompres jika terlalu besar."}
        </p>
      </div>
      
      {/* Hidden input to pass base64 string to Server Action */}
      <input type="hidden" name="imageFileBase64" value={base64} />

      {preview && (
        <div className="relative mt-4 aspect-video w-full max-w-sm overflow-hidden rounded-lg border border-border bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt="Preview"
            className="h-full w-full object-contain"
          />
        </div>
      )}
    </div>
  );
}
