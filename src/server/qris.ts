/**
 * QRIS Dinamis dari QRIS Statis milik toko (EMVCo Merchant Presented Mode).
 *
 * String QR stiker (statis, PoI "11", tanpa nominal) ditanam nominal order
 * + nomor bill, lalu CRC dihitung ulang → QR per transaksi dengan nominal
 * terkunci. Cara validasi & format mengikuti standar QRIS/ASPI.
 */

export type QrisField = { id: string; value: string };

/** CRC16-CCITT (poly 0x1021, init 0xFFFF) — checksum field 63 QRIS. */
export function qrisCrc16(payload: string): string {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

/** Pecah string QRIS menjadi field TLV level-atas. Longgar: ikut panjang tertulis. */
export function parseQris(payload: string): QrisField[] {
  const fields: QrisField[] = [];
  let i = 0;
  const s = payload.trim();
  while (i + 4 <= s.length) {
    const id = s.slice(i, i + 2);
    const len = Number.parseInt(s.slice(i + 2, i + 4), 10);
    if (!/^\d{2}$/.test(id) || !Number.isFinite(len) || len < 0) break;
    const value = s.slice(i + 4, i + 4 + len);
    if (value.length < len) break;
    fields.push({ id, value });
    i += 4 + len;
  }
  return fields;
}

function getField(fields: QrisField[], id: string): QrisField | undefined {
  return fields.find((f) => f.id === id);
}

/** Cek integritas string QRIS statis sebelum dipakai (mencegah QR rusak). */
export function validateStaticQris(payload: string): { merchantName: string; currency: string } {
  const s = payload.trim();
  if (!s.startsWith("000201")) throw new Error("String QRIS tidak valid (awalan 000201).");
  const fields = parseQris(s);
  const poi = getField(fields, "01");
  if (!poi || poi.value !== "11") throw new Error("QRIS ini bukan tipe statis (PoI harus 11).");
  const currency = getField(fields, "53");
  if (!currency || currency.value !== "360") throw new Error("Mata uang QRIS harus IDR (360).");
  const crcField = getField(fields, "63");
  if (!crcField || crcField.value.length !== 4) throw new Error("CRC QRIS tidak ditemukan.");
  const body = s.slice(0, s.length - 4);
  if (qrisCrc16(body) !== crcField.value.toUpperCase()) {
    throw new Error("CRC QRIS statis tidak cocok — string rusak/salah salin.");
  }
  const name = getField(fields, "59");
  return { merchantName: (name?.value || "").trim(), currency: currency.value };
}

/**
 * Ubah QRIS statis → dinamis: PoI 11→12, tanam nominal (field 54),
 * cantumkan nomor bill/order (field 62 sub 01), hitung ulang CRC.
 * amount = rupiah bulat, 1..999999999999.
 */
export function toDynamicQris(
  staticPayload: string,
  amount: number,
  billRef: string,
): { payload: string; merchantName: string } {
  const { merchantName } = validateStaticQris(staticPayload);
  if (!Number.isInteger(amount) || amount < 1 || amount > 999999999999) {
    throw new Error("Nominal QRIS tidak valid.");
  }
  let s = staticPayload.trim();

  // 1. PoI statis→dinamis (posisi baku: 6 digit pertama "000201", lalu "010211")
  if (!s.startsWith("000201010211")) throw new Error("Format PoI QRIS tak terduga.");
  s = `000201010212${s.slice(12)}`;

  const amountStr = String(amount);
  const amountField = `54${String(amountStr.length).padStart(2, "0")}${amountStr}`;

  // 2. Buang CRC lama.
  const crcIdx = s.lastIndexOf("6304");
  if (crcIdx < 0) throw new Error("Field CRC (63) tidak ditemukan.");
  let body = s.slice(0, crcIdx);

  // 3. Tanam/ganti nominal: ganti field 54 bila ada, else sisipkan sebelum field 58.
  const fields = parseQris(body);
  const has54 = fields.some((f) => f.id === "54");
  if (has54) {
    let out = "";
    let i = 0;
    while (i + 4 <= body.length) {
      const id = body.slice(i, i + 2);
      const len = Number.parseInt(body.slice(i + 2, i + 4), 10);
      const chunk = body.slice(i, i + 4 + len);
      out += id === "54" ? amountField : chunk;
      i += 4 + len;
    }
    body = out;
  } else {
    const idx58 = body.indexOf("5802ID");
    if (idx58 < 0) throw new Error("Field negara (58) tidak ditemukan.");
    body = `${body.slice(0, idx58)}${amountField}${body.slice(idx58)}`;
  }

  // 4. Nomor bill/order (field 62 sub 01) — membantu cocokkan mutasi.
  // Parse ulang dengan offset agar tidak salah kena digit di dalam value.
  const ref = billRef.replace(/[^A-Za-z0-9-]/g, "").slice(-20);
  if (ref) {
    const sub = `01${String(ref.length).padStart(2, "0")}${ref}`;
    const chunks: { id: string; raw: string; pos: number }[] = [];
    let p = 0;
    while (p + 4 <= body.length) {
      const id = body.slice(p, p + 2);
      const len = Number.parseInt(body.slice(p + 2, p + 4), 10);
      if (!/^\d{2}$/.test(id) || !Number.isFinite(len) || len < 0) break;
      const raw = body.slice(p, p + 4 + len);
      if (raw.length < 4 + len) break;
      chunks.push({ id, raw, pos: p });
      p += 4 + len;
    }
    const f62 = chunks.find((c) => c.id === "62");
    if (f62) {
      const inner = f62.raw.slice(4);
      const merged = `${inner}${sub}`;
      const replacement = `62${String(merged.length).padStart(2, "0")}${merged}`;
      body = `${body.slice(0, f62.pos)}${replacement}${body.slice(f62.pos + f62.raw.length)}`;
    } else {
      // Sisipkan field 62 baru: sesudah field <62 terakhir (jaga urutan ID menaik).
      const addition = `62${String(sub.length).padStart(2, "0")}${sub}`;
      const anchor = [...chunks].reverse().find((c) => c.id < "62");
      body = anchor
        ? `${body.slice(0, anchor.pos + anchor.raw.length)}${addition}${body.slice(anchor.pos + anchor.raw.length)}`
        : `${addition}${body}`;
    }
  }

  // 5. CRC baru.
  const withCrcHead = `${body}6304`;
  return { payload: `${withCrcHead}${qrisCrc16(withCrcHead)}`, merchantName };
}
