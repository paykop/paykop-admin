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
      // Allow http only in non-production (e.g. local API / ngrok without TLS)
      if (process.env.NODE_ENV !== "production") {
        return url.toString();
      }
    }

    return null;
  } catch {
    return null;
  }
}
