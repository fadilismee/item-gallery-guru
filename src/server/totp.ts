/**
 * Two-Factor Authentication (TOTP, RFC 6238) untuk login admin.
 * Murni node:crypto — tanpa dependensi tambahan. Kompatibel dengan
 * Google Authenticator / 1Password / Bitwarden (SHA1, 30 detik, 6 digit).
 */
import { createHmac, randomBytes } from "node:crypto";

const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

/** Buat secret base32 acak baru — tempel hasilnya ke ADMIN_TOTP_SECRET. */
export function generateTotpSecret(bytes = 20): string {
  const buf = randomBytes(bytes);
  let out = "";
  let bits = 0;
  let value = 0;
  for (const byte of buf) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      out += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) out += BASE32_ALPHABET[(value << (5 - bits)) & 31];
  return out;
}

export function base32Decode(input: string): Buffer {
  const clean = input.replace(/[\s=]/g, "").toUpperCase();
  if (!clean) throw new Error("Secret kosong.");
  let bits = 0;
  let value = 0;
  const bytes: number[] = [];
  for (const ch of clean) {
    const idx = BASE32_ALPHABET.indexOf(ch);
    if (idx < 0) throw new Error("Secret base32 tidak valid.");
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  return Buffer.from(bytes);
}

function hotp(key: Buffer, counter: bigint): string {
  const msg = Buffer.alloc(8);
  msg.writeBigUInt64BE(counter);
  const h = createHmac("sha1", key).update(msg).digest();
  const offset = h[h.length - 1] & 0x0f;
  const code =
    ((h[offset] & 0x7f) << 24) |
    ((h[offset + 1] & 0xff) << 16) |
    ((h[offset + 2] & 0xff) << 8) |
    (h[offset + 3] & 0xff);
  return String(code % 1_000_000).padStart(6, "0");
}

/** Kode 6 digit untuk suatu waktu (default: sekarang). */
export function totpAt(secret: string, timeMs: number = Date.now(), stepSecs = 30): string {
  const key = base32Decode(secret);
  const counter = BigInt(Math.floor(timeMs / 1000 / stepSecs));
  return hotp(key, counter);
}

/** Verifikasi kode dengan toleransi ±windowSteps langkah (default ±30 detik). */
export function verifyTotp(secret: string, code: string, windowSteps = 1): boolean {
  const clean = code.replace(/[\s-]/g, "");
  if (!/^\d{6}$/.test(clean)) return false;
  const now = Date.now();
  for (let w = -windowSteps; w <= windowSteps; w++) {
    try {
      if (totpAt(secret, now + w * 30_000) === clean) return true;
    } catch {
      return false;
    }
  }
  return false;
}

/** Secret 2FA dari environment. Kosong = 2FA nonaktif (mode password saja). */
export function getTotpSecret(): string {
  return (process.env.ADMIN_TOTP_SECRET || "").trim();
}
