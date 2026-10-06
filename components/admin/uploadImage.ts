import { api } from "@/components/admin/api";

export type UploadedImage = { url: string; width?: number; height?: number };

export async function uploadImage(file: File): Promise<UploadedImage> {
  const form = new FormData();
  form.append("file", file);
  return api<UploadedImage>("/api/admin/upload", { method: "POST", body: form });
}
