# 📑 Dokumen Bukti Integrasi API & Verifikasi Tokopay.id

**Merchant Name:** vithoup (Buana Computer Store)  
**Merchant ID:** `M241007BVDUY606`  
**Website Resmi:** [buanacomputer.web.id](https://buanacomputer.web.id)  
**Tanggal Verifikasi:** 24 September 2026

---

## 1. Data Teknis Integrasi Merchant

| Parameter                  | Nilai / Konfigurasi                                         | Status                       |
| -------------------------- | ----------------------------------------------------------- | ---------------------------- |
| **Merchant ID**            | `M241007BVDUY606`                                           | Terverifikasi (`rc: 200`)    |
| **Nama Toko di Tokopay**   | `vithoup`                                                   | Aktif                        |
| **Website Toko Live**      | `https://buanacomputer.web.id`                              | Live & Deployed di Vercel    |
| **URL Webhook / Callback** | `https://buanacomputer.web.id/api/webhook/tokopay`          | Aktif (Menangani POST & GET) |
| **IP Whitelist Terdaftar** | `76.76.21.21` (Vercel Server) & `182.8.226.190` (Local Dev) | Terdaftar                    |
| **Database Transaksi**     | Supabase Cloud (`https://zowifzglponvqdyshmph.supabase.co`) | Tabel `orders` Aktif         |
| **Payment Channel Target** | QRIS (`QRIS`, `QRISREALTIME`, `QRIS2`)                      | Menunggu Pembukaan Jalur API |

---

## 2. Bukti Response API (Curl / Node.js)

### A. Uji Coba Autentikasi Akun Merchant (`GET /v1/merchant/balance`)

Perintah terminal (Curl):

```bash
curl -G "https://api.tokopay.id/v1/merchant/balance?merchant=M241007BVDUY606&signature=1163264653f32f936f75290fa4d56f83"
```

Atau perintah terminal (PowerShell / Node.js):

```powershell
node -e "fetch('https://api.tokopay.id/v1/merchant/balance?merchant=M241007BVDUY606&signature=1163264653f32f936f75290fa4d56f83').then(r=>r.json()).then(console.log)"
```

**Response Sukses dari Server Tokopay:**

```json
{
  "status": 1,
  "rc": 200,
  "message": "",
  "data": {
    "nama_toko": "vithoup",
    "saldo_tersedia": 0,
    "saldo_tertahan": 0
  },
  "ts": 1790261024
}
```

_(Status: Autentikasi Merchant ID & Secret Key berhasil 100%)._

---

### B. Uji Coba Pembuatan Order Transaksi (`GET /v1/order`)

Perintah terminal:

```bash
curl -G "https://api.tokopay.id/v1/order?merchant=M241007BVDUY606&secret=8856bdc822ad6b4598b96d5d5b13603ed5e85d38ce4876a881ff91f6a909fd5b&ref_id=INV-TEST-001&nominal=10000&metode=QRIS"
```

**Response dari Server Tokopay:**

```json
{
  "status": 0,
  "error_msg": "Mohon maaf, layanan API Transaksi saat ini ditutup sementara hingga batas waktu yang belum ditentukan."
}
```

---

## 3. URL Halaman Toko Siap Uji Coba

1. **Halaman Katalog Depan:**  
   [https://buanacomputer.web.id](https://buanacomputer.web.id)
2. **Halaman Detail Produk & Tombol Beli QRIS:**  
   [https://buanacomputer.web.id/produk/BMC-btr18650](https://buanacomputer.web.id/produk/BMC-btr18650)
3. **Contoh Invoice Publik & Status Realtime:**  
   [https://buanacomputer.web.id/order/INV-20260924-4745](https://buanacomputer.web.id/order/INV-20260924-4745)
4. **Halaman Profil & Jaminan Garansi Toko:**  
   [https://buanacomputer.web.id/about](https://buanacomputer.web.id/about)

---

## 4. Perintah Terminal untuk Cek Langsung (One-Liner)

Jalankan perintah ini di PowerShell / Terminal untuk menampilkan output live:

```powershell
node -e "const mId = 'M241007BVDUY606'; const sKey = '8856bdc822ad6b4598b96d5d5b13603ed5e85d38ce4876a881ff91f6a909fd5b'; const sig = require('crypto').createHash('md5').update(mId + ':' + sKey).digest('hex'); fetch('https://api.tokopay.id/v1/merchant/balance?merchant=' + mId + '&signature=' + sig).then(r => r.json()).then(d => console.log('1. STATUS AKUN MERCHANT:', JSON.stringify(d, null, 2))); fetch('https://api.tokopay.id/v1/order?merchant=' + mId + '&secret=' + sKey + '&ref_id=TEST-' + Date.now() + '&nominal=10000&metode=QRIS').then(r => r.json()).then(d => console.log('2. RESPONSE TRANSAKSI QRIS:', JSON.stringify(d, null, 2)));"
```

---

## 5. Template Chat Siap Kirim ke CS / Support Tokopay.id

```text
Halo Tim Support Tokopay.id,

Saya pemilik akun merchant:
- Merchant ID: M241007BVDUY606
- Nama Toko: vithoup (Buana Computer Store)
- Website Live: https://buanacomputer.web.id
- Webhook Callback: https://buanacomputer.web.id/api/webhook/tokopay
- IP Whitelist: 76.76.21.21 dan 182.8.226.190

Integrasi sistem checkout di website kami sudah selesai 100% (pengecekan saldo/merchant info via API berhasil status 200). Namun saat request pembuatan order QRIS (/v1/order), response API mengembalikan notifikasi:
"Mohon maaf, layanan API Transaksi saat ini ditutup sementara hingga batas waktu yang belum ditentukan."

IP server sudah kami daftarkan di dashboard. Mohon bantuannya untuk mengaktifkan / membuka kembali jalur API Transaksi QRIS pada akun merchant kami agar transaksi pelanggan dapat berjalan normal.

Terima kasih!
```
