# 💳 Panduan Lengkap & Rekapitulasi Integrasi Payment Gateway (PG)

**Platform:** Buana Computer Store ([buanacomputer.web.id](https://buanacomputer.web.id))  
**Tanggal Update:** 24 September 2026  
**Status Saat Ini:** Hybrid Ready (Tripay QRIS Sandbox + Supabase Cloud DB + Fallback WA/Marketplace)

---

## 📌 Ringkasan Status Payment Gateway

| Item                     | Tokopay.id                                         | Tripay.co.id (Rekomendasi Aktif)                               |
| ------------------------ | -------------------------------------------------- | -------------------------------------------------------------- |
| **Status API Gateway**   | ⚠️ Ditutup sementara oleh pihak Tokopay            | 🟢 **100% Aktif & Normal**                                     |
| **Kredensial Terpasang** | `M241007BVDUY606`                                  | `T35186` (Merchant Code)                                       |
| **Metode Pembayaran**    | QRIS                                               | QRIS Dinamis (ShopeePay, BCA, GoPay, DANA, dll)                |
| **Formula Signature**    | MD5 (`merchant_id:secret:ref_id`)                  | HMAC-SHA256 (`merchant_code + ref_id + amount`, `private_key`) |
| **Webhook URL**          | `https://buanacomputer.web.id/api/webhook/tokopay` | `https://buanacomputer.web.id/api/webhook/tripay`              |
| **Database Penyimpanan** | Supabase (`public.orders`)                         | Supabase (`public.orders`)                                     |

---

## 🔍 Detail Masalah & Catatan Khusus Tiap Gateway

### 1. Tokopay.id

- **Kendala yang Ditemukan:**  
  Saat request order dikirim ke server Tokopay (`/v1/order`), server Tokopay mengembalikan pesan:  
  `"Mohon maaf, layanan API Transaksi saat ini ditutup sementara hingga batas waktu yang belum ditentukan."`
- **Status:**  
  Akun terautentikasi normal (`rc: 200` saat cek balance), namun fitur _Create Transaction_ dinonaktifkan oleh manajemen Tokopay pusat.
- **Tindakan:**  
  Bukti teknis dan template tiket CS sudah tersimpan di `TOKOPAY-BUKTI-INTEGRASI.md`.

---

### 2. Tripay.co.id (Gateway yang Sedang Terhubung)

- **Kondisi Sandbox:**  
  API Key `DEV-...` berhasil membuat transaksi dan menghasilkan `qr_url` serta `reference` unik (`DEV-T35186...`).  
  _Catatan Sandbox:_ QRIS pada mode sandbox menghasilkan data testing (`SANDBOX MODE`), sehingga scanner m-banking bank asli (BCA, Mandiri, dll) akan menolaknya sebagai QR tidak valid. Simulasi sukses dapat dilakukan via [tripay.co.id/simulator](https://tripay.co.id/simulator) atau tombol demo di web.
- **Form Pendaftaran / Verifikasi Merchant Live:**  
  Ketika mengajukan aktivasi ke akun Live/Production di Tripay:
  - **Tipe Toko:** _Guest Checkout / Tanpa Login_ (Pembeli bisa langsung klik barang ➔ Beli via QRIS ➔ bayar tanpa harus registrasi member).
  - **Data Login Tester (jika diminta pada form):**
    - URL Web: `https://buanacomputer.web.id`
    - Username: `Guest Checkout (Direct Purchase)`
    - Password: `Beli langsung via QRIS tanpa login`
    - Link Admin (bila reviewer butuh): `https://buanacomputer.web.id/admin-login` (Password di `.env`).
- **Langkah Mengaktifkan Uang Asli (Mode Live):**  
  Tinggal mengganti kredensial di dashboard Vercel & `.env` dengan key production Tripay (tanpa awalan `DEV-`).

---

## 🗄️ Database Supabase (Cloud Orders)

- **Project URL:** `https://zowifzglponvqdyshmph.supabase.co`
- **Tabel:** `public.orders`
- **Skema Kolom:**
  - `id` (text, Primary Key): Format `INV-YYYYMMDD-XXXX`
  - `customer_name` (text): Nama pemesan
  - `customer_phone` (text): Nomor WhatsApp
  - `customer_address` (text, optional): Alamat pengiriman
  - `items` (jsonb): Array produk, varian, qty, harga
  - `total_amount` (bigint): Total tagihan IDR
  - `payment_gateway` (text): `tripay` / `tokopay` / `manual_wa`
  - `payment_channel` (text): `qris` / `va`
  - `payment_status` (text): `PENDING` ➔ `PAID` ➔ `EXPIRED` ➔ `FAILED`
  - `payment_url` (text): URL QRIS Tripay
  - `tripay_reference` (text): Kode transaksi Tripay
  - `created_at` (timestamp): Waktu order dibuat
  - `paid_at` (timestamp): Waktu pembayaran lunas

---

## 🛡️ Kebijakan Garansi & SOP Retur (Trust Building)

Sistem sudah dilengkapi modal SOP garansi di semua titik transaksi:

1. **Garansi Laptop Second:** 1 Bulan Hardware (Mainboard, RAM, SSD, Layar, Keyboard), Baterai 14 hari.
2. **Garansi PC Rakitan:** 1 – 3 Bulan Toko (Part baru bergaransi distributor resmi 1–3 tahun).
3. **Garansi Storage (SSD/HDD):** 3 – 12 Bulan (Sentinel 100% tested, klaim ganti baru).
4. **SOP 100% Refund:** Jika unit pengganti tidak tersedia atau ada kendala teknis dalam masa garansi, dana kembali utuh 100% via transfer bank maksimal 1×24 jam.

---

## 🛒 4 Opsi Pembelian yang Tersedia di Web Saat Ini:

1. **⚡ QRIS Instan (Tripay / Tokopay):** Popup bayar langsung dengan invoice otomatis.
2. **💬 Chat WhatsApp Toko:** Negosiasi harga & COD Toko Banguntapan, Bantul.
3. **🟢 Tokopedia Resmi:** [tokopedia.com/bmccomp](https://www.tokopedia.com/bmccomp) (Rekber aman 100%).
4. **🟠 Shopee Resmi:** Link toko Shopee Buana Computer.
