"use client";

import * as React from "react";
import { UploadCloud, FileCheck2, X, AlertCircle, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { ACCEPTED_IMAGE_TYPES, MAX_FILE_SIZE } from "@/lib/validation";

interface CertificateUploadProps {
  file: File | null;
  onChange: (file: File | null) => void;
  error?: string;
}

export default function CertificateUpload({
  file,
  onChange,
  error,
}: CertificateUploadProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = React.useState(false);
  const [localError, setLocalError] = React.useState<string | null>(null);
  const [preview, setPreview] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (file && file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    }
    setPreview(null);
  }, [file]);

  function validateAndSet(f: File | undefined | null) {
    setLocalError(null);
    if (!f) return;
    if (!ACCEPTED_IMAGE_TYPES.includes(f.type as (typeof ACCEPTED_IMAGE_TYPES)[number])) {
      setLocalError("Upload a JPG, PNG, WEBP, or PDF file.");
      return;
    }
    if (f.size > MAX_FILE_SIZE) {
      setLocalError("File must be 5 MB or smaller.");
      return;
    }
    onChange(f);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    validateAndSet(e.dataTransfer.files?.[0]);
  }

  const shownError = localError ?? error;

  return (
    <div className="space-y-2">
      {!file ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={cn(
            "flex w-full flex-col items-center justify-center gap-3 rounded-xl2 border-2 border-dashed bg-card px-6 py-10 text-center transition-colors",
            dragging
              ? "border-primary bg-primary/5"
              : "border-input hover:border-primary/40 hover:bg-primary/[0.03]",
            shownError && "border-destructive/60"
          )}
        >
          <span className="grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary">
            <UploadCloud className="h-6 w-6" />
          </span>
          <span className="text-sm font-medium text-foreground">
            Drop your FSSAI certificate here, or{" "}
            <span className="text-primary underline underline-offset-2">browse</span>
          </span>
          <span className="text-xs text-muted-foreground">
            JPG, PNG, WEBP or PDF · up to 5 MB
          </span>
        </button>
      ) : (
        <div className="flex items-center gap-4 rounded-xl2 border border-border bg-card p-3">
          <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-lg bg-primary/5">
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={preview}
                alt="Certificate preview"
                className="h-full w-full object-cover"
              />
            ) : (
              <FileText className="h-7 w-7 text-primary/60" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1.5 truncate text-sm font-medium text-foreground">
              <FileCheck2 className="h-4 w-4 shrink-0 text-primary" />
              {file.name}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {(file.size / 1024).toFixed(0)} KB · ready to upload
            </p>
          </div>
          <button
            type="button"
            aria-label="Remove file"
            onClick={() => {
              onChange(null);
              if (inputRef.current) inputRef.current.value = "";
            }}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,application/pdf"
        className="sr-only"
        onChange={(e) => validateAndSet(e.target.files?.[0])}
      />

      {shownError && (
        <p className="flex items-center gap-1.5 text-xs font-medium text-destructive">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          {shownError}
        </p>
      )}
    </div>
  );
}
