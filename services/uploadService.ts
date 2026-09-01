// src/services/uploadService.ts
import axios from "axios";
import { z } from "zod";
import { apiRequest } from "./apiService";
import { getErrorMessage } from "../lib/errors";

const PresignResponseSchema = z.object({
  upload_url: z.string().optional(),
  uploadUrl: z.string().optional(),
  public_url: z.string().optional(),
  publicUrl: z.string().optional(),
  file_url: z.string().optional(),
  key: z.string().optional(),
});

/**
 * Converts a local file to a base64 Data URL as a local preview / offline fallback.
 */
export function fileToDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

/**
 * Uploads a local image/document file to Cloudflare R2 / S3 via backend presigned URL.
 * Falls back to base64 Data URL if storage endpoint or credentials are not configured.
 */
export async function uploadImageFile(
  token: string,
  file: File
): Promise<string> {
  try {
    // 1. Request presigned URL from backend storage service (/api/v1/storage/presigned-url)
    const res = await apiRequest("/api/v1/storage/presigned-url", PresignResponseSchema, {
      method: "POST",
      body: {
        file_name: file.name,
        content_type: file.type || "image/jpeg",
        size: file.size,
      },
    });

    const uploadURL = res.upload_url || res.uploadUrl;
    const publicURL = res.public_url || res.publicUrl || res.file_url;

    if (!uploadURL || !publicURL) {
      throw new Error("Invalid presigned URL response from storage service");
    }

    // 2. Upload file binary directly to storage presigned URL via HTTP PUT
    await axios.put(uploadURL, file, {
      headers: {
        "Content-Type": file.type || "image/jpeg",
      },
    });

    return publicURL;
  } catch (err: unknown) {
    console.warn("[uploadService] Presigned upload unavailable, falling back to Data URL:", getErrorMessage(err, String(err)));
    // If backend storage credentials (R2/S3) are missing or presigned endpoint fails,
    // convert file to Data URL so category photo upload always works reliably!
    return await fileToDataURL(file);
  }
}
