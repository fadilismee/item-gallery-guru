# 🔌 Cara Tripay Terhubung ke Buana Computer Store

**Dokumen integrasi untuk tim Tripay / verifikator merchant**  
**Toko:** Buana Computer Store — [buanacomputer.web.id](https://buanacomputer.web.id)  
**Tanggal:** 24 September 2026

Dokumen ini menjelaskan dari sisi Tripay: URL apa yang harus diisi di dashboard Tripay, format apa yang dikirim & diterima, dan cara mengetesnya. Semua poin mengikuti [docs resmi Tripay](https://tripay.co.id/developer).

---

## 1. Yang Perlu Diisi di Dashboard Tripay

| Kolom di Dashboard Tripay                | Nilai untuk Buana Computer                        |
| ---------------------------------------- | ------------------------------------------------- |
| **Callback / Webhook URL**               | `https://buanacomputer.web.id/api/webhook/tripay` |
| **Return URL** (per transaksi, otomatis) | `https://buanacomputer.web.id/order/{orderId}`    |
| **IP Whitelist (opsional)**              | Server Vercel: `76.76.21.21`                      |
| **Mode**                                 | Sandbox untuk testing, Live untuk uang asli       |

---

## 2. Alur Transaksi (Closed Payment)

```
Pembeli checkout di web
  → Server kami: signature HMAC-SHA256(merchantCode + merchantRef + amount, privateKey)
  → POST /api(-sandbox)/transaction/create { method, merchant_ref, amount,
      customer_*, order_items, callback_url, return_url, expired_time, signature }
  → Tripay balas { qr_url / pay_code / checkout_url / reference / status }
  → Web tampilkan QR / nomor VA ke pembeli, simpan invoice PENDING di database
  → Pembeli bayar
  → Tripay POST callback ke URL di §1  ──▶ server verifikasi & update LUNAS
```

## 3. Format Callback yang Kami Terima & Validasi

- **Method:** `POST`, **Content-Type:** `application/json`
- **Header wajib:** `X-Callback-Signature`, `X-Callback-Event: payment_status`
- **Verifikasi:** `HMAC-SHA256(raw JSON body, privateKey)` dibandingkan timing-safe dengan `X-Callback-Signature`. Signature salah / event bukan `payment_status` → kami balas `{ "success": false }`.
- **Field yang dipakai:** `reference`, `merchant_ref`, `status` (`PAID`/`EXPIRED`/`FAILED`/`REFUND`), `total_amount`, `paid_at` (unix timestamp).
- **Keamanan tambahan:** `merchant_ref` harus cocok dengan invoice di database, `tripay_reference` harus cocok bila sudah tersimpan, dan `total_amount` harus sama persis dengan total invoice — bila tidak, callback ditolak.
- **Respons sukses:** `{ "success": true }` (sesuai docs; selain itu Tripay retry 3x tiap 2 menit).
- **Status `REFUND`** dari Tripay kami catat sebagai `REFUNDED` (refund manual ditransfer admin via bank, karena closed-payment Tripay tidak punya API refund otomatis).

## 4. Channel yang Kami Pakai & Batasnya (sesuai tabel docs)

| Channel                      | Kode                                      | Min–Maks        | Expired |
| ---------------------------- | ----------------------------------------- | --------------- | ------- |
| QRIS                         | `QRIS`                                    | Rp 1rb – 5jt    | 1 jam   |
| BCA / BRI / Mandiri / BNI VA | `BCAVA` / `BRIVA` / `MANDIRIVA` / `BNIVA` | Rp 10rb – 10jt  | 24 jam  |
| Alfamart / Indomaret         | `ALFAMART` / `INDOMARET`                  | Rp 10rb – 2,5jt | 24 jam  |

Nominal di luar batas ditolak sebelum request (pesan ramah ke pembeli).

## 5. Cara Mengetes Koneksi

**Tes koneksi API key (tanpa transaksi):**

```powershell
node -e "fetch('https://tripay.co.id/api-sandbox/merchant/payment-channel',{headers:{'Authorization':'Bearer API_KEY_ANDA'}}).then(r=>r.json()).then(d=>console.log(d.success?'OK':'GAGAL', d.message||''))"
```

Atau dari dashboard admin kami: `/admin/payment` → **Tes Koneksi** (ada untuk Tripay & Tokopay).

**Tes end-to-end sandbox:**

1. Buat pesanan di web (mode Sandbox) → QR sandbox muncul + invoice `PENDING`.
2. Buka [tripay.co.id/simulator](https://tripay.co.id/simulator), masukkan kode referensi → **Bayar**.
3. Callback masuk → invoice otomatis `PAID`. Cek silang manual: tombol **✓ Cek ke Tripay** di halaman invoice / log admin.

## 6. Data Login Verifikasi (Akun Admin Toko Asli)

Untuk keperluan verifikasi merchant, tim Tripay login memakai **akun admin toko yang asli** (bukan akun khusus/limit):

- **URL Login:** `https://admin.buanacomputer.web.id/admin-login`
- **Kredensial:** password admin asli, diberikan langsung oleh pemilik toko via jalur pribadi (tidak ditulis di dokumen ini).
- **Isi di dalam:** Dashboard ringkasan + Log Transaksi (`/admin/order`, saat ini berisi data transaksi + data uji berlabel `TEST-`) lengkap dengan tombol verifikasi silang ke Tripay. Produksi berjalan mode lihat-jarak-jauh; checkout pembeli guest (tanpa login).
- **Catatan:** password admin akan kami **rotasi/ganti setelah proses verifikasi selesai**.

## 7. Kontak Teknis Toko

- WhatsApp: `0859-7922-0599`
- Alamat: Mertosan Kulon, Potorono, Banguntapan, Bantul, DI Yogyakarta 55196
- Invoice publik per transaksi: `https://buanacomputer.web.id/order/{orderId}`
