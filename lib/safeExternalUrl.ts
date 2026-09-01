/**
 * Returns a safe http(s) URL for use in href attributes, or null if unsafe.
 * Rejects javascript:, data:, and other non-http schemes.
 */
export function safeExternalUrl(raw: string | null | undefined): string | null {
  if (!raw || typeof raw !== "string") return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;

  try {
    const url = new URL(trimmed);
    const protocol = url.protocol.toLowerCase();

    if (protocol === "https:") return url.toString();

    if (protocol === "http:") {
      const host = url.hostname.toLowerCase();
      if (host === "localhost" || host === "127.0.0.1" || host === "[::1]") {
        return url.toString();
      }
      if (process.env.NODE_ENV !== "production") {
        return url.toString();
      }
    }

    return null;
  } catch {
    return null;
  }
}

function getAllowedImageHosts(): Set<string> {
  const raw = process.env.NEXT_PUBLIC_ALLOWED_IMAGE_HOSTS || "";
  return new Set(
    raw
      .split(",")
      .map((h) => h.trim().toLowerCase())
      .filter(Boolean)
  );
}

/** Safe image src with optional CDN host allowlist. */
export function safeImageSrc(raw: string | null | undefined): string | null {
  const safe = safeExternalUrl(raw);
  if (!safe) return null;

  const allowlist = getAllowedImageHosts();
  if (allowlist.size === 0) return safe;

  try {
    const host = new URL(safe).hostname.toLowerCase();
    return allowlist.has(host) ? safe : null;
  } catch {
    return null;
  }
}
