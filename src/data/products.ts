export type Product = {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  oldPrice?: number;
  rating: number;
  sold: number;
  stock: number;
  condition: "Baru" | "Bekas";
  location: string;
  shortDescription: string;
  description: string;
  specs: { label: string; value: string }[];
  images: number;
  image: string;
  gallery: string[];
};

export const categories = ["Laptop", "PC Rakitan", "Monitor", "Komponen", "Aksesoris", "Storage"];

const img = (seed: string, w = 600, h = 600) => `https://picsum.photos/seed/${seed}/${w}/${h}`;
const unsplash = (id: string, w = 600) =>
  `https://images.unsplash.com/${id}?w=${w}&auto=format&fit=crop&q=60`;

export const products: Product[] = [
  {
    id: "laptop-gaming-rtx-4060",
    name: 'Laptop Gaming 15.6" RTX 4060 / i7-13650HX / 16GB / 1TB',
    brand: "MicroBuild",
    category: "Laptop",
    price: 18500000,
    oldPrice: 20900000,
    rating: 4.9,
    sold: 128,
    stock: 12,
    condition: "Baru",
    location: "Batam",
    shortDescription: "Laptop gaming layar 144Hz dengan performa kelas atas.",
    description:
      "Laptop gaming dengan prosesor Intel Core i7 generasi ke-13 dan kartu grafis RTX 4060. Panel 144Hz, sistem pendingin ganda, dan keyboard RGB per-key. Cocok untuk gaming berat, editing video, dan rendering 3D.",
    specs: [
      { label: "Prosesor", value: "Intel Core i7-13650HX" },
      { label: "GPU", value: "NVIDIA GeForce RTX 4060 8GB" },
      { label: "RAM", value: "16GB DDR5 5200MHz" },
      { label: "Penyimpanan", value: "1TB NVMe SSD" },
      { label: "Layar", value: '15.6" FHD 144Hz' },
      { label: "Garansi", value: "2 Tahun Resmi" },
    ],
    images: 4,
    image: unsplash("photo-1603302576837-37561b2e2302", 600),
    gallery: [
      unsplash("photo-1603302576837-37561b2e2302", 800),
      img("buana-laptop-gaming-2", 800, 800),
      img("buana-laptop-gaming-3", 800, 800),
      img("buana-laptop-gaming-4", 800, 800),
    ],
  },
  {
    id: "laptop-ultrabook-14",
    name: 'Ultrabook 14" Ryzen 7 / 16GB / 512GB SSD',
    brand: "MicroBook",
    category: "Laptop",
    price: 11250000,
    oldPrice: 12500000,
    rating: 4.8,
    sold: 246,
    stock: 20,
    condition: "Baru",
    location: "Batam",
    shortDescription: "Tipis, ringan, baterai tahan seharian.",
    description:
      "Ultrabook ringan 1.2kg dengan bodi aluminium, layar IPS 2.2K, dan baterai hingga 14 jam. Ideal untuk kerja mobile dan kuliah.",
    specs: [
      { label: "Prosesor", value: "AMD Ryzen 7 7730U" },
      { label: "RAM", value: "16GB LPDDR4X" },
      { label: "Penyimpanan", value: "512GB NVMe SSD" },
      { label: "Layar", value: '14" 2.2K IPS' },
      { label: "Berat", value: "1.2 kg" },
      { label: "Garansi", value: "1 Tahun Resmi" },
    ],
    images: 4,
    image: unsplash("photo-1496181133206-80ce9b88a853", 600),
    gallery: [
      unsplash("photo-1496181133206-80ce9b88a853", 800),
      img("buana-ultrabook-2", 800, 800),
      img("buana-ultrabook-3", 800, 800),
      img("buana-ultrabook-4", 800, 800),
    ],
  },
  {
    id: "pc-rakitan-creator",
    name: "PC Rakitan Creator Ryzen 7 7700 / RTX 4070 / 32GB",
    brand: "MicroBuild",
    category: "PC Rakitan",
    price: 24900000,
    rating: 5,
    sold: 42,
    stock: 6,
    condition: "Baru",
    location: "Batam",
    shortDescription: "Rakitan siap pakai untuk konten kreator.",
    description:
      "PC rakitan lengkap dengan casing airflow, pendingin AIO 240mm, dan PSU 80+ Gold. Sudah terpasang Windows dan driver, tinggal colok monitor.",
    specs: [
      { label: "Prosesor", value: "AMD Ryzen 7 7700" },
      { label: "GPU", value: "NVIDIA RTX 4070 12GB" },
      { label: "RAM", value: "32GB DDR5 6000MHz" },
      { label: "Penyimpanan", value: "2TB NVMe Gen4" },
      { label: "PSU", value: "750W 80+ Gold" },
      { label: "Garansi", value: "1 Tahun Toko" },
    ],
    images: 4,
    image: unsplash("photo-1593642632823-8f785ba67e45", 600),
    gallery: [
      unsplash("photo-1593642632823-8f785ba67e45", 800),
      img("buana-pc-creator-2", 800, 800),
      img("buana-pc-creator-3", 800, 800),
      img("buana-pc-creator-4", 800, 800),
    ],
  },
  {
    id: "pc-office-basic",
    name: "PC Office Intel i5-12400 / 16GB / 512GB SSD",
    brand: "MicroBuild",
    category: "PC Rakitan",
    price: 7350000,
    oldPrice: 7990000,
    rating: 4.7,
    sold: 310,
    stock: 25,
    condition: "Baru",
    location: "Batam",
    shortDescription: "Paket kantor hemat, cepat, dan awet.",
    description:
      "PC kantor untuk kebutuhan administrasi, kasir, dan multitasking harian. Hemat listrik dan senyap.",
    specs: [
      { label: "Prosesor", value: "Intel Core i5-12400" },
      { label: "RAM", value: "16GB DDR4" },
      { label: "Penyimpanan", value: "512GB NVMe SSD" },
      { label: "Motherboard", value: "H610M" },
      { label: "PSU", value: "500W" },
      { label: "Garansi", value: "1 Tahun Toko" },
    ],
    images: 3,
    image: unsplash("photo-1587202372775-e229f172b9d7", 600),
    gallery: [
      unsplash("photo-1587202372775-e229f172b9d7", 800),
      img("buana-pc-office-2", 800, 800),
      img("buana-pc-office-3", 800, 800),
    ],
  },
  {
    id: "monitor-27-165hz",
    name: 'Monitor Gaming 27" QHD 165Hz IPS',
    brand: "MicroView",
    category: "Monitor",
    price: 3450000,
    oldPrice: 3990000,
    rating: 4.8,
    sold: 187,
    stock: 18,
    condition: "Baru",
    location: "Batam",
    shortDescription: "QHD 165Hz, 1ms, dukungan FreeSync.",
    description:
      "Monitor 27 inci resolusi 2560x1440 dengan refresh rate 165Hz dan panel IPS akurasi warna 99% sRGB.",
    specs: [
      { label: "Ukuran", value: "27 inci" },
      { label: "Resolusi", value: "2560 x 1440 QHD" },
      { label: "Refresh Rate", value: "165Hz" },
      { label: "Panel", value: "IPS 1ms MPRT" },
      { label: "Port", value: "2x HDMI, 1x DisplayPort" },
      { label: "Garansi", value: "3 Tahun" },
    ],
    images: 3,
    image: unsplash("photo-1527443224154-c4a3942d3acf", 600),
    gallery: [
      unsplash("photo-1527443224154-c4a3942d3acf", 800),
      img("buana-monitor27-2", 800, 800),
      img("buana-monitor27-3", 800, 800),
    ],
  },
  {
    id: "vga-rtx-4060-ti",
    name: "VGA RTX 4060 Ti 8GB GDDR6 Dual Fan",
    brand: "MicroParts",
    category: "Komponen",
    price: 6850000,
    rating: 4.9,
    sold: 96,
    stock: 9,
    condition: "Baru",
    location: "Batam",
    shortDescription: "Kartu grafis 1440p hemat daya.",
    description:
      "Kartu grafis dua kipas dengan backplate metal, mendukung DLSS 3 dan ray tracing generasi terbaru.",
    specs: [
      { label: "GPU", value: "NVIDIA RTX 4060 Ti" },
      { label: "Memori", value: "8GB GDDR6" },
      { label: "Interface", value: "PCIe 4.0 x8" },
      { label: "Daya", value: "160W (rekomendasi PSU 550W)" },
      { label: "Garansi", value: "3 Tahun" },
    ],
    images: 3,
    image: unsplash("photo-1591488320449-011701bb6704", 600),
    gallery: [
      unsplash("photo-1591488320449-011701bb6704", 800),
      img("buana-vga-2", 800, 800),
      img("buana-vga-3", 800, 800),
    ],
  },
  {
    id: "ssd-nvme-1tb",
    name: "SSD NVMe Gen4 1TB (7000MB/s)",
    brand: "MicroStore",
    category: "Storage",
    price: 1150000,
    oldPrice: 1390000,
    rating: 4.9,
    sold: 520,
    stock: 60,
    condition: "Baru",
    location: "Batam",
    shortDescription: "Kecepatan baca hingga 7000MB/s.",
    description:
      "SSD NVMe PCIe Gen4 dengan heatsink tipis, cocok untuk upgrade laptop maupun PC desktop.",
    specs: [
      { label: "Kapasitas", value: "1TB" },
      { label: "Interface", value: "PCIe 4.0 x4 NVMe" },
      { label: "Baca / Tulis", value: "7000 / 5500 MB/s" },
      { label: "Form Factor", value: "M.2 2280" },
      { label: "Garansi", value: "5 Tahun" },
    ],
    images: 3,
    image: unsplash("photo-1592899677977-9bb10ba128a1", 600),
    gallery: [
      unsplash("photo-1592899677977-9bb10ba128a1", 800),
      img("buana-ssd-2", 800, 800),
      img("buana-ssd-3", 800, 800),
    ],
  },
  {
    id: "keyboard-mechanical-tkl",
    name: "Keyboard Mechanical TKL Hot-Swap RGB",
    brand: "MicroGear",
    category: "Aksesoris",
    price: 675000,
    oldPrice: 850000,
    rating: 4.7,
    sold: 431,
    stock: 44,
    condition: "Baru",
    location: "Batam",
    shortDescription: "Hot-swap, gasket mount, RGB per tombol.",
    description:
      "Keyboard mekanikal TKL dengan switch linear pre-lubed, keycap PBT double-shot, dan konektivitas kabel USB-C lepas pasang.",
    specs: [
      { label: "Layout", value: "TKL 87 Keys" },
      { label: "Switch", value: "Linear Red (hot-swap)" },
      { label: "Keycap", value: "PBT Double-shot" },
      { label: "Koneksi", value: "USB-C Detachable" },
      { label: "Garansi", value: "1 Tahun" },
    ],
    images: 3,
    image: unsplash("photo-1589578228447-e1a4e481c6c8", 600),
    gallery: [
      unsplash("photo-1589578228447-e1a4e481c6c8", 800),
      img("buana-keyboard-2", 800, 800),
      img("buana-keyboard-3", 800, 800),
    ],
  },
  {
    id: "laptop-bekas-thinkpad",
    name: 'Laptop Bekas Bisnis 14" i5-10310U / 16GB / 512GB',
    brand: "MicroBook",
    category: "Laptop",
    price: 4750000,
    rating: 4.6,
    sold: 74,
    stock: 5,
    condition: "Bekas",
    location: "Batam",
    shortDescription: "Unit second mulus, sudah dicek teknisi.",
    description:
      "Laptop bisnis bekas kondisi mulus, keyboard nyaman, bodi kokoh. Sudah melalui pengecekan menyeluruh oleh teknisi toko.",
    specs: [
      { label: "Prosesor", value: "Intel Core i5-10310U" },
      { label: "RAM", value: "16GB DDR4" },
      { label: "Penyimpanan", value: "512GB SSD" },
      { label: "Layar", value: '14" FHD IPS' },
      { label: "Garansi", value: "1 Bulan Toko" },
    ],
    images: 3,
    image: unsplash("photo-1588872657578-7efd1f1555ed", 600),
    gallery: [
      unsplash("photo-1588872657578-7efd1f1555ed", 800),
      img("buana-thinkpad-2", 800, 800),
      img("buana-thinkpad-3", 800, 800),
    ],
  },
  {
    id: "printer-multifungsi",
    name: "Printer Multifungsi Ink Tank Wireless",
    brand: "MicroPrint",
    category: "Aksesoris",
    price: 2790000,
    rating: 4.5,
    sold: 152,
    stock: 14,
    condition: "Baru",
    location: "Batam",
    shortDescription: "Print, scan, copy, dan cetak dari HP.",
    description:
      "Printer tangki tinta dengan biaya cetak sangat hemat, mendukung cetak nirkabel dari ponsel dan laptop.",
    specs: [
      { label: "Fungsi", value: "Print, Scan, Copy" },
      { label: "Koneksi", value: "Wi-Fi, USB" },
      { label: "Kecepatan", value: "33 ppm (hitam)" },
      { label: "Garansi", value: "2 Tahun" },
    ],
    images: 3,
    image: unsplash("photo-1612815154858-60aa4c59eaa6", 600),
    gallery: [
      unsplash("photo-1612815154858-60aa4c59eaa6", 800),
      img("buana-printer-2", 800, 800),
      img("buana-printer-3", 800, 800),
    ],
  },
  {
    id: "ram-ddr5-32gb",
    name: "RAM DDR5 32GB (2x16GB) 6000MHz CL30",
    brand: "MicroParts",
    category: "Komponen",
    price: 1890000,
    rating: 4.8,
    sold: 118,
    stock: 22,
    condition: "Baru",
    location: "Batam",
    shortDescription: "Kit dual channel latensi rendah.",
    description:
      "Kit memori DDR5 dengan heatsink aluminium dan profil EXPO/XMP siap pakai untuk gaming maupun workstation.",
    specs: [
      { label: "Kapasitas", value: "32GB (2x16GB)" },
      { label: "Kecepatan", value: "6000MHz" },
      { label: "Latensi", value: "CL30" },
      { label: "Profil", value: "EXPO / XMP 3.0" },
      { label: "Garansi", value: "Lifetime" },
    ],
    images: 3,
    image: unsplash("photo-1591799264318-7e6ef8ddb7ea", 600),
    gallery: [
      unsplash("photo-1591799264318-7e6ef8ddb7ea", 800),
      img("buana-ram-2", 800, 800),
      img("buana-ram-3", 800, 800),
    ],
  },
  {
    id: "monitor-24-office",
    name: 'Monitor Office 24" FHD IPS Bezel Tipis',
    brand: "MicroView",
    category: "Monitor",
    price: 1350000,
    oldPrice: 1590000,
    rating: 4.6,
    sold: 268,
    stock: 30,
    condition: "Baru",
    location: "Batam",
    shortDescription: "Nyaman di mata untuk kerja seharian.",
    description:
      "Monitor 24 inci dengan mode low blue light dan flicker free, dudukan bisa dimiringkan.",
    specs: [
      { label: "Ukuran", value: "24 inci" },
      { label: "Resolusi", value: "1920 x 1080" },
      { label: "Refresh Rate", value: "75Hz" },
      { label: "Port", value: "HDMI, VGA" },
      { label: "Garansi", value: "3 Tahun" },
    ],
    images: 3,
    image: img("buana-monitor24", 600, 600),
    gallery: [
      img("buana-monitor24-1", 800, 800),
      img("buana-monitor24-2", 800, 800),
      img("buana-monitor24-3", 800, 800),
    ],
  },
];

export const formatPrice = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

export const getProduct = (id: string) => products.find((p) => p.id === id);
