export type SupabaseSessionCookie = {
  access_token?: string;
};

function decodeBase64UrlWithAtob(input: string) {
  const base64 = input.replace(/-/g, "+").replace(/_/g, "/");
  const padLen = (4 - (base64.length % 4)) % 4;
  const padded = base64 + "=".repeat(padLen);
  return atob(padded);
}

function decodeBase64UrlWithBuffer(input: string) {
  const base64 = input.replace(/-/g, "+").replace(/_/g, "/");
  const padLen = (4 - (base64.length % 4)) % 4;
  const padded = base64 + "=".repeat(padLen);
  // eslint-disable-next-line no-undef
  return Buffer.from(padded, "base64").toString("utf8");
}

export function decodeBase64Url(input: string) {
  // Edge runtime has atob, Node runtime has Buffer.
  // We support both so this helper can be shared.
  if (typeof atob === "function") return decodeBase64UrlWithAtob(input);
  return decodeBase64UrlWithBuffer(input);
}

export function getAccessTokenFromSupabaseAuthCookieValue(rawValue: string | null): string | null {
  if (!rawValue) return null;
  if (!rawValue.startsWith("base64-")) return null;

  try {
    const jsonStr = decodeBase64Url(rawValue.slice("base64-".length));
    const session = JSON.parse(jsonStr) as SupabaseSessionCookie;
    return session.access_token ?? null;
  } catch {
    return null;
  }
}

export function getAccessTokenFromCookieHeader(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;
  const parts = cookieHeader.split(";").map((p) => p.trim());
  const tokenPair = parts.find((p) => p.startsWith("sb-") && p.includes("-auth-token="));
  if (!tokenPair) return null;
  const idx = tokenPair.indexOf("=");
  if (idx === -1) return null;
  const raw = decodeURIComponent(tokenPair.slice(idx + 1));
  return getAccessTokenFromSupabaseAuthCookieValue(raw);
}

