import "server-only";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

/** Public storage bucket that holds product images (primary + gallery). */
export const PRODUCT_IMAGE_BUCKET = "product-images";

const ACCEPTED = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB per image
const MAX_GALLERY = 6;

async function uploadOne(file: File, vendorId: string): Promise<string> {
  if (!ACCEPTED.includes(file.type)) {
    throw new Error("Only JPG, PNG or WebP images are allowed.");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("Each image must be under 5 MB.");
  }
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const path = `${vendorId}/${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}.${ext}`;
  const bytes = Buffer.from(await file.arrayBuffer());

  const { error } = await supabaseAdmin.storage
    .from(PRODUCT_IMAGE_BUCKET)
    .upload(path, bytes, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type || "image/jpeg",
    });
  if (error) throw new Error(`Image upload failed: ${error.message}`);

  const { data } = supabaseAdmin.storage
    .from(PRODUCT_IMAGE_BUCKET)
    .getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Reads the primary `image` file and any `gallery` files (label / nutrition /
 * ingredients panels) from a submitted form, uploads them, and returns the
 * resulting public URLs. Fields are only present in the result when a new file
 * was actually provided, so callers can preserve existing images on edit.
 */
export async function collectProductImages(
  formData: FormData,
  vendorId: string
): Promise<{ image_url?: string; image_urls?: string[] }> {
  const out: { image_url?: string; image_urls?: string[] } = {};

  const main = formData.get("image");
  if (main instanceof File && main.size > 0) {
    out.image_url = await uploadOne(main, vendorId);
  }

  const gallery = formData
    .getAll("gallery")
    .filter((f): f is File => f instanceof File && f.size > 0)
    .slice(0, MAX_GALLERY);
  if (gallery.length) {
    const urls: string[] = [];
    for (const f of gallery) urls.push(await uploadOne(f, vendorId));
    out.image_urls = urls;
  }

  return out;
}
