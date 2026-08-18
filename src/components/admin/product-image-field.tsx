"use client";

import { useRef, useState } from "react";
import { Loader2, UploadCloud } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api/client";
import type { UploadResponse } from "@/lib/api/types";

export function ProductImageField({ id, initialUrl }: { id: string; initialUrl?: string | null }) {
  const [imageUrl, setImageUrl] = useState(initialUrl ?? "");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    try {
      const body = await apiFetch<UploadResponse>("/api/v1/uploads/images", {
        method: "POST",
        body: (() => {
          const fd = new FormData();
          fd.append("file", file);
          return fd;
        })(),
      });
      setImageUrl(body.url);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Error al subir la imagen");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>Imagen del producto</Label>
      <Input
        id={id}
        name="imageUrl"
        type="url"
        value={imageUrl}
        onChange={(e) => setImageUrl(e.target.value)}
        placeholder="https://…"
      />
      <Button
        type="button"
        variant="outline"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
        className="h-9 w-full"
      >
        {uploading ? <Loader2 className="animate-spin" /> : <UploadCloud className="size-4" />}
        {uploading ? "Subiendo…" : "Subir imagen"}
      </Button>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handleUpload}
      />
      {uploadError && <p className="text-sm text-destructive">{uploadError}</p>}
      {imageUrl && (
        <div className="relative aspect-[4/5] w-40 overflow-hidden rounded-md border border-border bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageUrl} alt="Vista previa de la imagen del producto" className="h-full w-full object-cover" />
        </div>
      )}
    </div>
  );
}