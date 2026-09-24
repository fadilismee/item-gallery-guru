# 📑 Dokumen Integrasi Payment Gateway Tripay.co.id

**Merchant Name:** Merchant Sandbox (Buana Computer Store)  
**Kode Merchant:** `T35186`  
**Website Resmi:** [buanacomputer.web.id](https://buanacomputer.web.id)  
**Dokumentasi Resmi:** [tripay.co.id/developer](https://tripay.co.id/developer)

---

## 1. Konfigurasi Merchant & Environment

| Parameter                  | Nilai / Konfigurasi                                              | Status                      |
| -------------------------- | ---------------------------------------------------------------- | --------------------------- |
| **Kode Merchant**          | `T35186`                                                         | Terverifikasi Aktif         |
| **API Key (Sandbox)**      | `DEV-crOyCsZR5BBHhFld4c5QQMCynd07ylKncmyMZi3d`                   | Terverifikasi               |
| **Private Key**            | `IDjFa-tQj1V-mLm1r-tqiju-WIJI0`                                  | Terverifikasi               |
| **URL Webhook / Callback** | `https://buanacomputer.web.id/api/webhook/tripay`                | Aktif (Menangani POST JSON) |
| **Return URL**             | `https://buanacomputer.web.id/order/{orderId}`                   | Aktif                       |
| **Channel Aktif**          | `QRIS` (ShopeePay, BCA, Gopay, OVO, Dana, Mandiri, BRI, dll)     | **100% Live**               |
| **Database Transaksi**     | Supabase PostgreSQL (`https://zowifzglponvqdyshmph.supabase.co`) | Tabel `orders` Aktif        |

---

## 2. Cara Kerja Checkout QRIS Tripay di Buana Computer

1. **Pengunjung Memilih Produk:**
   - Di halaman `/produk/:id` atau popup keranjang belanja, pengunjung mengklik tombol **"Beli Langsung via QRIS (Tripay)"**.
2. **Server Membuat Closed Transaction:**
   - Server menghitung signature HMAC-SHA256: `hash_hmac('sha256', merchant_code + order_id + amount, private_key)`.
   - Mengirim request POST ke `https://tripay.co.id/api-sandbox/transaction/create`.
   - Menerima `qr_url` resmi, `reference` (contoh: `DEV-T35186...`), dan `checkout_url`.
3. **Penyimpanan di Supabase:**
   - Order tersimpan di Supabase dengan status `PENDING`.
4. **Pembayaran & Webhook Otomatis:**
   - Setelah pembeli scan QRIS, server Tripay mengirim callback POST ke `https://buanacomputer.web.id/api/webhook/tripay`.
   - Status order di Supabase otomatis terupdate menjadi `PAID` (LUNAS).
   - Pengunjung otomatis dialihkan ke invoice lunas: `/order/INV-XXXXX`.

---

## 3. Uji Coba Cepat Pembuatan Transaksi via Terminal (Node.js)

```powershell
node -e "const crypto = require('crypto'); const mCode = 'T35186'; const aKey = 'DEV-crOyCsZR5BBHhFld4c5QQMCynd07ylKncmyMZi3d'; const pKey = 'IDjFa-tQj1V-mLm1r-tqiju-WIJI0'; const orderId = 'INV-TEST-' + Date.now(); const amount = 25000; const signature = crypto.createHmac('sha256', pKey).update(mCode + orderId + String(amount)).digest('hex'); fetch('https://tripay.co.id/api-sandbox/transaction/create', { method: 'POST', headers: { 'Authorization': 'Bearer ' + aKey, 'Content-Type': 'application/json' }, body: JSON.stringify({ method: 'QRIS', merchant_ref: orderId, amount: amount, customer_name: 'Pembeli Uji Coba', customer_email: 'customer@buanacomputer.web.id', customer_phone: '085979220599', order_items: [{ sku: 'TEST', name: 'Barang Uji Coba', price: amount, quantity: 1 }], callback_url: 'https://buanacomputer.web.id/api/webhook/tripay', return_url: 'https://buanacomputer.web.id/order/' + orderId, expired_time: Math.floor(Date.now() / 1000) + 86400, signature: signature }) }).then(r => r.json()).then(d => console.log('Response Tripay:', JSON.stringify(d, null, 2))).catch(console.error);"
```

---

## 4. Pengaturan di Dashboard Tripay (Merchant Integration)

1. Buka [tripay.co.id/member/merchant](https://tripay.co.id/member/merchant)
2. Masuk ke tab **Pengaturan Integrasi (API)**:
   - **URL Callback:** `https://buanacomputer.web.id/api/webhook/tripay`
   - **IP Whitelist:** Kosongkan atau masukkan `76.76.21.21` (Vercel)
   - **Mode:** Sandbox (untuk pengujian) / Production (jika sudah aktivasi live)
