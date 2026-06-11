/**
 * sessionCrypto.js
 *
 * Shared AES-256-GCM encrypt/decrypt for the session cookie.
 * Works on both Edge runtime (middleware) and Node.js 18+ (API routes)
 * via the Web Crypto API (globalThis.crypto.subtle).
 *
 * Cookie payload shape (permissions): { ev: boolean, ...otherPermissions }
 * (Extendable — add more keys to the object in future without changing the API)
 *
 * Requires:  COOKIE_SECRET env variable (min 16 chars recommended 32+)
 */

const SALT = "skillmedha-sv1"; // fixed salt — change only forces all sessions to expire

/** Derives a stable AES-256-GCM CryptoKey from the COOKIE_SECRET env variable. */
async function deriveKey(secret) {
  const enc = new TextEncoder();
  // SHA-256 the secret+salt to get exactly 256 bits regardless of secret length
  const raw = await crypto.subtle.digest("SHA-256", enc.encode(secret + SALT));
  return crypto.subtle.importKey("raw", raw, { name: "AES-GCM" }, false, [
    "encrypt",
    "decrypt",
  ]);
}

/**
 * Encrypt a plain-JS payload object → base64 string.
 * Cookie stored as:  base64( 12-byte-IV + AES-GCM-ciphertext )
 */
export async function encryptSession(payload) {
  const secret = process.env.COOKIE_SECRET;
  if (!secret) {
    // Fallback (no secret configured): plain base64 — not secure but won't crash
    console.warn("[sessionCrypto] COOKIE_SECRET is not set — storing unencrypted");
    return btoa(JSON.stringify(payload));
  }

  const key = await deriveKey(secret);
  const iv = crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV (GCM standard)
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    new TextEncoder().encode(JSON.stringify(payload))
  );

  // Pack: IV (12 bytes) || ciphertext
  const packed = new Uint8Array(12 + ciphertext.byteLength);
  packed.set(iv, 0);
  packed.set(new Uint8Array(ciphertext), 12);

  return btoa(String.fromCharCode(...packed));
}

/**
 * Decrypt a base64 cookie value → payload object, or null if invalid/tampered.
 *
 * Returns null on ANY error — callers should treat null as "not verified".
 */
export async function decryptSession(token) {
  if (!token) return null;

  // Backwards compat: plain-text values from sessions before encryption was added
  if (token === "true") return { ev: true };
  if (token === "false") return { ev: false };

  const secret = process.env.COOKIE_SECRET;
  if (!secret) {
    // No secret: attempt plain base64 fallback
    try {
      return JSON.parse(atob(token));
    } catch {
      return null;
    }
  }

  try {
    const key = await deriveKey(secret);
    const packed = Uint8Array.from(atob(token), (c) => c.charCodeAt(0));

    if (packed.length < 13) return null; // too short to be valid

    const iv = packed.slice(0, 12);
    const ciphertext = packed.slice(12);

    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      key,
      ciphertext
    );

    return JSON.parse(new TextDecoder().decode(decrypted));
  } catch {
    // AES-GCM authentication tag mismatch → tampered or wrong key
    return null;
  }
}
