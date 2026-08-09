"use client";

import { useState } from "react";
import { twMerge } from "tailwind-merge";
import { UploadButton } from "@/lib/uploadthing";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ProductImageField({ id, initialUrl }: { id: string; initialUrl?: string | null }) {
  const [imageUrl, setImageUrl] = useState(initialUrl ?? "");
  const [uploadError, setUploadError] = useState<string | null>(null);

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
      <UploadButton
        endpoint="productImage"
        onClientUploadComplete={(res) => {
          const url = res[0]?.ufsUrl;
          if (url) {
            setImageUrl(url);
            setUploadError(null);
          }
        }}
        onUploadError={(error: Error) => setUploadError(error.message)}
        config={{ cn: twMerge }}
        appearance={{
          button:
            "h-9 w-full rounded-md border border-border bg-foreground text-sm font-medium text-background " +
            "transition-colors hover:bg-foreground/90 " +
            "data-[state=ready]:bg-foreground data-[state=ready]:hover:bg-foreground/90 data-[state=ready]:text-background " +
            "data-[state=readying]:bg-foreground/80 data-[state=uploading]:bg-foreground/80",
          allowedContent: "hidden",
        }}
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
