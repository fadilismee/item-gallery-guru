import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Activity,
  ArrowRight,
  BadgePercent,
  CheckCircle2,
  ChevronDown,
  Clock,
  Coffee,
  Cpu,
  CreditCard,
  ExternalLink,
  Eye,
  Flame,
  Gauge,
  HardDrive,
  Headphones,
  HelpCircle,
  Laptop,
  MapPin,
  MessageCircle,
  Monitor,
  MonitorCheck,
  Navigation,
  PackageCheck,
  ParkingCircle,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Store,
  ThermometerSnowflake,
  Wifi,
  XCircle,
  Zap,
} from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { CountUp, Reveal } from "@/components/Reveal";
import reviewsData from "@/data/reviews.json";
import poster1 from "@/img/Buanacomputer-poster1.jpg";
import poster2 from "@/img/Buanacomputer-poster2.jpg";
import poster3 from "@/img/Buanacomputer-poster3.jpg";

const WA_NUMBER = "6285979220599";
const WA_CONSULT = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(
  "Halo Buana Computer, saya mau tanya produk katalog dan konsultasi spek komputer",
)}`;

const faqs = [
  {
    q: "Apakah produk laptop dan PC yang dijual di Buana Computer bergaransi?",
    a: "Pasti. Semua unit laptop second, PC rakitan, dan komponen yang kami jual memiliki garansi toko resmi (1 bulan hingga 1 tahun tergantung kategori barang). Nota pembelian fisik dan digital kami sertakan sebagai bukti garansi sah.",
  },
  {
    q: "Bolehkah saya datang langsung ke toko untuk cek fisik dan coba unit?",
    a: "Sangat boleh dan sangat kami sarankan! Anda bisa datang langsung ke toko kami di Banguntapan, Bantul. Kami sediakan meja uji khusus agar Anda bisa mengetes keyboard, layar, audio, performa, dan aplikasi sepuasnya.",
  },
  {
    q: "Apakah Buana Computer melayani pengiriman ke luar kota / luar pulau?",
    a: "Ya, kami melayani pengiriman ke seluruh wilayah Indonesia melalui ekspedisi terpercaya (JNE, J&T, SiCepat). Setiap pengiriman dikemas dengan bubble wrap berlapis, dus tebal, stiker fragile, serta opsi asuransi dan packing kayu.",
  },
  {
    q: "Apakah bisa request rakit PC dengan budget atau spesifikasi khusus?",
    a: "Tentu bisa! Silakan chat WhatsApp kami dengan menyebutkan budget dan kebutuhan penggunaan (misal: budget 5 juta untuk editing video atau budget 8 juta untuk game kompetitif). Kami akan buatkan rincian spek terbaik yang paling efisien.",
  },
  {
    q: "Metode pembayaran apa saja yang diterima di toko?",
    a: "Kami menerima pembayaran tunai (cash di toko), transfer bank instan (BCA, Mandiri, BRI), pembayaran via QRIS, serta transaksi aman melalui marketplace resmi Tokopedia Buana Computer.",
  },
];

const aboutJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "AboutPage",
      "@id": "https://buanacomputer.web.id/about#webpage",
      url: "https://buanacomputer.web.id/about",
      name: "Tentang Buana Computer Store — Toko Laptop & PC Bantul Yogyakarta",
      description:
        "Profil resmi Buana Computer Store: toko komputer dan laptop di Banguntapan, Bantul, Yogyakarta dengan garansi toko resmi dan pengujian hardware ketat.",
      isPartOf: {
        "@type": "WebSite",
        "@id": "https://buanacomputer.web.id/#website",
        name: "Buana Computer",
        url: "https://buanacomputer.web.id",
      },
    },
    {
      "@type": "ComputerStore",
      "@id": "https://buanacomputer.web.id/#store",
      name: "Buana Computer Store",
      image: "https://buanacomputer.web.id/Buanacomputer-logo.png",
      telephone: "+6285979220599",
      url: "https://buanacomputer.web.id",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Mertosan Kulon, Potorono, Kec. Banguntapan",
        addressLocality: "Bantul",
        addressRegion: "Daerah Istimewa Yogyakarta",
        postalCode: "55196",
        addressCountry: "ID",
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: -7.8372069,
        longitude: 110.4148331,
      },
      openingHoursSpecification: [
        {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
          opens: "09:00",
          closes: "20:00",
        },
      ],
      priceRange: "Rp 150.000 - Rp 25.000.000",
      sameAs: ["https://www.tokopedia.com/bmccomp"],
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://buanacomputer.web.id/about#breadcrumb",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: "https://buanacomputer.web.id/",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Tentang Toko",
          item: "https://buanacomputer.web.id/about",
        },
      ],
    },
    {
      "@type": "FAQPage",
      "@id": "https://buanacomputer.web.id/about#faq",
      mainEntity: faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: {
          "@type": "Answer",
          text: f.a,
        },
      })),
    },
  ],
};

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      {
        title: "Tentang Buana Computer Store — Toko Laptop & PC Terpercaya Bantul, Yogyakarta",
      },
      {
        name: "description",
        content:
          "Profil Buana Computer Store: toko komputer dan laptop di Banguntapan, Bantul, Yogyakarta. Menyediakan laptop second teruji, PC rakitan gaming & kerja, komponen terverifikasi, dan storage sentinel 100% dengan garansi toko jelas. WA 6285979220599.",
      },
      {
        name: "keywords",
        content:
          "toko laptop bantul, toko komputer bantul, jual laptop bekas jogja, rakit pc jogja, toko komputer yogyakarta, buana computer store, laptop second bantul, beli komponen pc jogja, toko laptop banguntapan",
      },
      {
        property: "og:title",
        content: "Tentang Buana Computer Store — Toko Laptop & PC Bantul, Yogyakarta",
      },
      {
        property: "og:description",
        content:
          "Gerai laptop & PC terpercaya di Yogyakarta: unit teruji benchmark ketat, transparansi kondisi 100%, garansi toko resmi, dan konsultasi rakit PC gratis.",
      },
      { property: "og:image", content: "https://buanacomputer.web.id/Buanacomputer-logo.png" },
      { property: "og:url", content: "https://buanacomputer.web.id/about" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://buanacomputer.web.id/about" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(aboutJsonLd),
      },
    ],
  }),
  component: AboutPage,
});

const metrics = [
  {
    count: 1200,
    prefix: "",
    suffix: "+",
    unit: " Unit",
    label: "Perangkat Terjual",
    foot: "Distribusi",
    footValue: "DIY & Se-Indonesia",
  },
  {
    count: 100,
    prefix: "",
    suffix: "%",
    unit: "",
    label: "Foto Produk Asli",
    foot: "Kejujuran",
    footValue: "Real Picture Gerai",
  },
  {
    count: 100,
    prefix: "",
    suffix: "%",
    unit: "",
    label: "Sentinel & Benchmark",
    foot: "Kesehatan Drive",
    footValue: "Storage 100% Health",
  },
  {
    count: 4.9,
    prefix: "",
    suffix: "",
    decimals: 1,
    unit: " / 5.0 ★",
    label: "Kepuasan Pelanggan",
    foot: "Review Publik",
    footValue: "Google & WhatsApp",
  },
  {
    display: "15–30",
    unit: " Mnt",
    label: "Tes Fisik di Toko",
    foot: "Fasilitas Gerai",
    footValue: "Coba Unit Sepuasnya",
  },
  {
    display: "1–12",
    unit: " Bln",
    label: "Garansi Toko Resmi",
    foot: "Purna Jual",
    footValue: "Klaim Cepat & Sah",
  },
];

const pillars = [
  {
    code: "PILAR 01 — LAPTOP SECOND TERPILIH",
    icon: Laptop,
    title: "Laptop Bekas Berkualitas, Mulus & Siap Pakai",
    desc: "Setiap laptop second yang kami sediakan telah melewati pengujian menyeluruh: kesehatan baterai, fungsi keyboard, port USB/HDMI, engsel layar, dan stabilitas suhu prosesor. Dilengkapi Windows aktif, Office, dan charger original.",
    link: "Lihat Katalog Laptop",
    to: "/",
  },
  {
    code: "PILAR 02 — PC RAKITAN SEIMBANG",
    icon: Cpu,
    title: "PC Rakitan Gaming, Editing & Kantor Bergaransi",
    desc: "Layanan custom rakit PC sesuai budget dan kebutuhan Anda. Kami merancang kombinasi prosesor, motherboard, RAM, dan VGA yang seimbang (bebas bottleneck), manajemen kabel rapi, serta sirkulasi udara casing yang optimal.",
    link: "Jelajahi PC Rakitan",
    to: "/",
  },
  {
    code: "PILAR 03 — STORAGE & KOMPONEN TERUJI",
    icon: HardDrive,
    title: "SSD, Hardisk, RAM & Komponen Berstandar Tinggi",
    desc: "Menyediakan media penyimpanan SSD NVMe M.2 dan SATA dengan garansi kesehatan 100% (bebas bad sector), RAM DDR4/DDR5 berkecepatan tinggi, monitor IPS jernih, hingga motherboard pengganti bergaransi toko.",
    link: "Cek Komponen & Storage",
    to: "/",
  },
  {
    code: "PILAR 04 — KONSULTASI & PURNA JUAL AMANAH",
    icon: Headphones,
    title: "Bimbingan Ramah & Klaim Garansi Tanpa Dipersulit",
    desc: "Bingung memilih spesifikasi? Tim kami siap berdiskusi santai melalui WhatsApp atau langsung di toko untuk memberikan saran terbaik tanpa paksaan belanja. Layanan purna jual kami responsif menangani setiap kendala.",
    link: "Konsultasi via WhatsApp",
    href: WA_CONSULT,
  },
];

const qcSteps = [
  {
    step: "01",
    icon: Zap,
    title: "Diagnosa Kelistrikan & Tegangan",
    desc: "Pengecekan power rail 3.3V, 5V, 12V, charging controller, dan tegangan standby untuk memastikan motherboard stabil tanpa kebocoran arus.",
    metric: "Voltmeter & Power Supply Test",
  },
  {
    step: "02",
    icon: Flame,
    title: "Stress Test Beban Berat (GPU & CPU)",
    desc: "Pengujian FurMark selama 15 menit dan Cinebench multi-core untuk memastikan VGA dan prosesor tahan beban kerja tanpa throttling (<75°C).",
    metric: "FurMark & Cinebench Pass",
  },
  {
    step: "03",
    icon: Gauge,
    title: "Uji Kesehatan Storage & Memori",
    desc: "Scanning CrystalDiskInfo memastikan sentinel 100% health tanpa bad sector, dan MemTest86 memastikan modul RAM bebas freeze/BSOD.",
    metric: "Sentinel 100% & 0 Error",
  },
  {
    step: "04",
    icon: MonitorCheck,
    title: "Inspeksi Layar, Keyboard & Port",
    desc: "Pengecekan 104 tombol keyboard, engsel laptop, speaker stereo, webcam, modul WiFi, serta panel layar bebas baret dalam dan dead-pixel.",
    metric: "100% I/O Verified",
  },
  {
    step: "05",
    icon: ThermometerSnowflake,
    title: "Deep Cleaning & Thermal Repaste",
    desc: "Pembersihan menyeluruh heatsink pendingin dari debu dan penggantian thermal paste kualitas tinggi berkonduktivitas tinggi sebelum dipajang.",
    metric: "Thermal Repaste Applied",
  },
];

const comparisonData = [
  {
    feature: "Foto Produk Katalog",
    buana: "Foto fisik asli (Real Picture) langsung dari gerai meja kerja.",
    other: "Sering menggunakan foto render katalog internet comotan.",
  },
  {
    feature: "Pengujian Sebelum Jual",
    buana: "Stress test FurMark, Cinebench, dan CrystalDiskInfo Sentinel 100%.",
    other: "Hanya dites sekadar menyala ke menu desktop tanpa beban kerja.",
  },
  {
    feature: "Garansi Toko Resmi",
    buana: "Garansi tertulis resmi dengan nota & segel toko sah (tukar/servis).",
    other: "Garansi personal tidak jelas atau lepas tangan setelah barang terkirim.",
  },
  {
    feature: "Fasilitas Cek di Lokasi",
    buana: "Bebas coba dan uji aplikasi sepuasnya di gerai Banguntapan Bantul.",
    other: "Hanya melayani COD di pinggir jalan atau tanpa lokasi toko fisik.",
  },
  {
    feature: "Konsultasi & Purna Jual",
    buana: "Didampingi tim teknisi ramah via WhatsApp dan siap bantu upgrade.",
    other: "Respon lambat atau tidak memahami aspek teknis hardware.",
  },
];

const categoriesQuickPick = [
  {
    title: "Laptop Second Pilihan",
    priceRange: "Mulai Rp 1,5 Jt – 12 Jt+",
    desc: "Core i3 hingga Core i7 / RTX series, mulus siap kerja dan kuliah.",
    icon: Laptop,
    to: "/",
    bgGradient: "from-blue-500/10 to-transparent",
  },
  {
    title: "PC Rakitan Gaming & Kreator",
    priceRange: "Mulai Rp 2,5 Jt – 25 Jt+",
    desc: "Custom rakitan seimbang, kabel rapi, suhu adem bergaransi.",
    icon: Cpu,
    to: "/",
    bgGradient: "from-purple-500/10 to-transparent",
  },
  {
    title: "Storage SSD & Hardisk",
    priceRange: "Mulai Rp 150 Rb – 1,2 Jt+",
    desc: "SSD NVMe M.2 & SATA sentinel 100% teruji bebas bad sector.",
    icon: HardDrive,
    to: "/",
    bgGradient: "from-emerald-500/10 to-transparent",
  },
  {
    title: "Monitor IPS Gaming & Office",
    priceRange: "Mulai Rp 600 Rb – 3,5 Jt+",
    desc: "Layar jernih refresh rate 75Hz hingga 165Hz warna akurat.",
    icon: Monitor,
    to: "/",
    bgGradient: "from-amber-500/10 to-transparent",
  },
];

const amenities = [
  { icon: ThermometerSnowflake, label: "Ruang Toko Nyaman Ber-AC" },
  { icon: MonitorCheck, label: "Meja Uji & Tes Unit Bebas" },
  { icon: Coffee, label: "Kopi & Teh Gratis saat Konsultasi" },
  { icon: Wifi, label: "Free High-Speed WiFi Speedtest" },
  { icon: ParkingCircle, label: "Parkir Mobil & Motor Luas" },
  { icon: Navigation, label: "Akses Mudah Dekat Ringroad" },
];

const standards = [
  {
    code: "STANDARD-01",
    icon: Activity,
    title: "Stress Test & Benchmark Ketat",
    desc: "Sebelum masuk rak etalase, setiap unit melewati pengujian FurMark, Cinebench, CrystalDiskInfo, dan MemTest86 untuk menjamin kestabilan beban kerja berat.",
  },
  {
    code: "STANDARD-02",
    icon: Eye,
    title: "Transparansi Kondisi 100%",
    desc: "Kami mendeskripsikan kondisi fisik apa adanya: bila ada lecet halus atau minus pemakaian wajar, selalu kami jelaskan di muka tanpa ada yang ditutupi.",
  },
  {
    code: "STANDARD-03",
    icon: ShieldCheck,
    title: "Garansi Toko Resmi & Jelas",
    desc: "Setiap pembelian disertai nota resmi dan segel garansi toko. Jika terjadi kerusakan hardware selama masa garansi, kami siap tukar unit atau perbaikan cepat.",
  },
  {
    code: "STANDARD-04",
    icon: PackageCheck,
    title: "Pengemasan Ekspedisi Berlapis",
    desc: "Untuk pesanan luar kota, pengemasan menggunakan bubble wrap ekstra tebal, kardus kokoh, dan opsi packing kayu agar barang tiba aman tanpa resiko benturan.",
  },
  {
    code: "STANDARD-05",
    icon: BadgePercent,
    title: "Harga Transparan & Masuk Akal",
    desc: "Harga yang tertera adalah harga riil siap pakai. Cocok untuk kantong mahasiswa, pekerja lepas, studio desain, hingga kebutuhan instansi perkantoran.",
  },
  {
    code: "STANDARD-06",
    icon: MonitorCheck,
    title: "Fasilitas Coba Unit Nyaman",
    desc: "Datang langsung ke gerai kami di Banguntapan Bantul. Anda dipersilakan mencoba performa unit, tes layar, dan mengetik keyboard sepuasnya sebelum membeli.",
  },
];

function SectionEyebrow({ children, light }: { children: string; light?: boolean }) {
  return (
    <span
      className={`font-monotech text-[11px] font-bold uppercase tracking-widest ${
        light ? "text-brand-200" : "text-pri"
      }`}
    >
      {children}
    </span>
  );
}

const heroShowcases = [
  {
    id: "laptop",
    tab: "Laptop Second",
    badge: "GRADE A/B • SIAP PAKAI",
    image: poster1,
    title: "Laptop Second Mulus & Bergaransi",
    desc: "Kesehatan baterai prima, keyboard 100% normal, layar jernih, charger original.",
    tag: "Core i3 - i7 / Ryzen / RTX",
    linkTo: "/",
  },
  {
    id: "pc",
    tab: "PC Rakitan",
    badge: "CUSTOM BUILD • BENCHMARK LOLOS",
    image: poster2,
    title: "PC Gaming, Editing & Office",
    desc: "Manajemen kabel rapi, sirkulasi udara adem, lolos uji FurMark & Cinebench.",
    tag: "Bebas Bottleneck & Upgradeable",
    linkTo: "/",
  },
  {
    id: "storage",
    tab: "Komponen & SSD",
    badge: "SENTINEL 100% • TERUJI",
    image: poster3,
    title: "Storage NVMe, RAM & Display IPS",
    desc: "SSD & HDD teruji bebas bad sector, RAM speed tinggi, monitor IPS warna akurat.",
    tag: "Garansi Toko Resmi Sah",
    linkTo: "/",
  },
];

const popularSearches = [
  { label: "Laptop Gaming", q: "laptop" },
  { label: "PC Rakitan", q: "pc" },
  { label: "SSD NVMe", q: "ssd" },
  { label: "Hardisk 2.5", q: "hardisk" },
  { label: "Monitor 165Hz", q: "monitor" },
];

function AboutHero() {
  const [activeTab, setActiveTab] = useState(0);
  const activeItem = heroShowcases[activeTab] ?? heroShowcases[0];

  return (
    <section className="relative flex min-h-[90vh] items-center justify-center overflow-hidden bg-techdark pb-28 pt-14 text-white">
      {/* Dynamic Animated Ambient Glow Background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[650px] w-[650px] -translate-x-1/2 rounded-full bg-pri/30 blur-[140px] animate-pulse-glow" />
        <div className="absolute top-1/4 -left-28 h-96 w-96 rounded-full bg-sec-container/20 blur-[120px] animate-float-slow" />
        <div className="absolute bottom-10 -right-28 h-[450px] w-[450px] rounded-full bg-pri-container/20 blur-[130px] animate-float-slow [animation-delay:2.5s]" />
        {/* Subtle Tech Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)] opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-t from-techdark via-techdark/85 to-techdark/70" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 xl:gap-14">
          {/* Sisi Kiri: Teks Editorial & Action CTA */}
          <div className="space-y-6 text-center lg:col-span-7 lg:text-left">
            <Reveal delayMs={50}>
              <div className="inline-flex items-center gap-2 rounded-full border border-pri/40 bg-pri/15 px-4 py-1.5 font-monotech text-xs uppercase tracking-wider text-brand-200 backdrop-blur-md transition-transform hover:scale-105 shadow-sm shadow-pri/20">
                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                Buana Computer Store • Banguntapan, Bantul
              </div>
            </Reveal>

            <Reveal delayMs={150}>
              <h1 className="font-heading text-3xl font-bold leading-[1.12] tracking-tight sm:text-5xl lg:text-6xl">
                Menghadirkan Hardware Komputer Berkualitas,{" "}
                <span className="bg-gradient-to-r from-brand-200 via-sky-300 to-teal-200 bg-clip-text text-transparent">
                  Jujur, &amp; Bergaransi Nyata
                </span>
              </h1>
            </Reveal>

            <Reveal delayMs={250}>
              <p className="max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
                Gerai laptop bekas berkualitas, custom PC rakitan, dan storage sentinel 100% di
                Banguntapan, Bantul. Melayani mahasiswa, kreator, gamer, dan instansi dengan
                pengujian ketat serta garansi toko resmi.
              </p>
            </Reveal>

            {/* Popular Searches Quick Tags */}
            <Reveal delayMs={300}>
              <div className="flex flex-wrap items-center justify-center gap-2 pt-1 lg:justify-start">
                <span className="font-monotech text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Cari Cepat:
                </span>
                {popularSearches.map((ps) => (
                  <Link
                    key={ps.label}
                    to="/"
                    className="rounded-lg border border-white/15 bg-white/5 px-2.5 py-1 text-xs font-medium text-slate-200 backdrop-blur-sm transition-all duration-200 hover:border-pri/50 hover:bg-pri/20 hover:text-white"
                  >
                    {ps.label}
                  </Link>
                ))}
              </div>
            </Reveal>

            {/* Dynamic CTA Buttons with Hover Lift */}
            <Reveal delayMs={350}>
              <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2 lg:justify-start">
                <Link
                  to="/"
                  className="group font-heading inline-flex items-center gap-2 rounded-xl bg-pri px-6 py-3.5 text-sm font-bold text-on-pri shadow-xl shadow-pri/30 transition-all duration-300 hover:-translate-y-1 hover:bg-pri-container hover:shadow-2xl hover:shadow-pri/40 active:scale-95"
                >
                  <ShoppingBag size={18} className="transition-transform group-hover:scale-110" />
                  Jelajahi Katalog Toko
                  <ArrowRight
                    size={16}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </Link>
                <a
                  href={WA_CONSULT}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group font-heading inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-6 py-3.5 text-sm font-bold text-white backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:bg-white/20 active:scale-95"
                >
                  <MessageCircle
                    size={18}
                    className="text-emerald-400 transition-transform group-hover:scale-110"
                  />
                  Konsultasi Spek via WhatsApp
                </a>
              </div>
            </Reveal>

            {/* Micro Trust Bar Under CTA */}
            <Reveal delayMs={450}>
              <div className="grid grid-cols-2 gap-3 pt-3 sm:grid-cols-4 text-left">
                <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-2.5 backdrop-blur-sm">
                  <ShieldCheck size={18} className="text-emerald-400 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-white leading-tight">Garansi Resmi</p>
                    <p className="font-mono text-[9px] text-slate-400">Nota &amp; Segel Sah</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-2.5 backdrop-blur-sm">
                  <Eye size={18} className="text-blue-400 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-white leading-tight">Foto Fisik Asli</p>
                    <p className="font-mono text-[9px] text-slate-400">Real Picture Gerai</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-2.5 backdrop-blur-sm">
                  <MonitorCheck size={18} className="text-purple-400 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-white leading-tight">Bebas Coba</p>
                    <p className="font-mono text-[9px] text-slate-400">Meja Uji Terbuka</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-2.5 backdrop-blur-sm">
                  <PackageCheck size={18} className="text-amber-400 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-white leading-tight">Kirim Aman</p>
                    <p className="font-mono text-[9px] text-slate-400">Dus &amp; Bubble Tebal</p>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>

          {/* Sisi Kanan: Interactive Showcase Visualizer with Tab Switching */}
          <div className="lg:col-span-5">
            <Reveal delayMs={300} scale>
              <div className="relative mx-auto max-w-md">
                {/* Showcase Tab Pills */}
                <div className="mb-3 flex items-center justify-between rounded-2xl border border-white/15 bg-slate-900/90 p-1.5 backdrop-blur-md">
                  {heroShowcases.map((s, idx) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setActiveTab(idx)}
                      className={`flex-1 rounded-xl py-1.5 text-xs font-heading font-bold transition-all duration-300 ${
                        activeTab === idx
                          ? "bg-pri text-white shadow-md shadow-pri/30"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      {s.tab}
                    </button>
                  ))}
                </div>

                {/* Glowing border showcase card */}
                <div className="group relative overflow-hidden rounded-3xl border border-white/20 bg-slate-900/90 p-3.5 shadow-2xl backdrop-blur-xl transition-all duration-500 hover:border-pri/50 hover:shadow-pri/25">
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-black">
                    <img
                      src={activeItem.image}
                      alt={activeItem.title}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

                    {/* Top Overlay Badge */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between text-xs text-white">
                      <div className="flex items-center gap-1.5 rounded-full bg-slate-950/80 px-3 py-1 font-mono text-[10px] font-bold text-emerald-400 backdrop-blur-md border border-white/15">
                        <span className="h-1.5 w-1.5 animate-ping rounded-full bg-emerald-400" />
                        {activeItem.badge}
                      </div>
                      <span className="rounded-md bg-black/60 px-2 py-0.5 font-mono text-[10px] text-slate-300 backdrop-blur-sm border border-white/10">
                        {activeItem.tag}
                      </span>
                    </div>

                    {/* Bottom Overlay Info */}
                    <div className="absolute bottom-3 left-3 right-3 text-left">
                      <h3 className="font-heading text-base font-bold text-white drop-shadow-sm">
                        {activeItem.title}
                      </h3>
                      <p className="mt-0.5 text-xs text-slate-300 line-clamp-1">
                        {activeItem.desc}
                      </p>
                    </div>
                  </div>

                  {/* Highlights telemetry row inside showcase card */}
                  <div className="mt-3 grid grid-cols-2 gap-2 text-left">
                    <div className="rounded-xl border border-white/10 bg-white/5 p-2.5">
                      <div className="flex items-center gap-1.5 text-emerald-400">
                        <Activity size={14} />
                        <span className="font-mono text-[10px] font-bold">100% SENTINEL</span>
                      </div>
                      <p className="font-heading text-[11px] font-bold text-white mt-1">
                        {activeItem.stats}
                      </p>
                    </div>
                    <Link
                      to={activeItem.linkTo}
                      className="group/link flex flex-col justify-between rounded-xl border border-pri/30 bg-pri/10 p-2.5 transition-all hover:bg-pri/20"
                    >
                      <div className="flex items-center justify-between text-brand-200 font-mono text-[10px] font-bold">
                        <span>KATALOG</span>
                        <ArrowRight
                          size={12}
                          className="transition-transform group-hover/link:translate-x-1"
                        />
                      </div>
                      <p className="font-heading text-[11px] font-bold text-white mt-1">
                        Lihat Pilihan Unit →
                      </p>
                    </Link>
                  </div>
                </div>

                {/* Floating pill accent bottom-left */}
                <div className="absolute -bottom-4 -left-4 hidden sm:flex items-center gap-2.5 rounded-2xl border border-pri/40 bg-slate-900/95 px-4 py-2.5 text-xs text-white shadow-xl backdrop-blur-xl animate-float">
                  <ShieldCheck size={20} className="text-emerald-400 shrink-0" />
                  <div>
                    <p className="font-bold">Garansi Toko Resmi</p>
                    <p className="font-mono text-[10px] text-slate-400">
                      Nota Fisik &amp; Digital Sah
                    </p>
                  </div>
                </div>

                {/* Floating pill accent top-right */}
                <div className="absolute -top-4 -right-4 hidden sm:flex items-center gap-2 rounded-2xl border border-amber-400/40 bg-slate-900/95 px-3.5 py-2 text-xs text-white shadow-xl backdrop-blur-xl animate-float [animation-delay:1.8s]">
                  <div className="flex items-center text-amber-400">
                    <Star size={14} fill="currentColor" />
                  </div>
                  <div>
                    <p className="font-bold text-[11px]">★ 4.9/5.0 Rating</p>
                    <p className="font-mono text-[9px] text-slate-400">1.200+ Unit Terjual</p>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>

        {/* Scroll Cue Indicator */}
        <div className="mt-14 flex justify-center">
          <div className="animate-bounce text-slate-400 opacity-60">
            <ChevronDown size={22} />
          </div>
        </div>
      </div>
    </section>
  );
}

function MetricsSection() {
  return (
    <section className="relative z-20 -mt-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
      <Reveal scale delayMs={100}>
        <div className="grid grid-cols-2 gap-3.5 rounded-3xl border border-slate-200/90 bg-white p-5 shadow-xl sm:grid-cols-3 sm:gap-6 sm:p-8 lg:grid-cols-6">
          {metrics.map((m) => (
            <div
              key={m.label}
              className="group flex flex-col justify-between rounded-2xl bg-surface-low p-4 text-center transition-all duration-300 hover:-translate-y-1 hover:bg-surface-high hover:shadow-md"
            >
              <div>
                <p className="font-heading text-xl font-extrabold text-technavy sm:text-2xl">
                  {m.count !== undefined ? (
                    <CountUp
                      end={m.count}
                      decimals={m.decimals ?? 0}
                      prefix={m.prefix ?? ""}
                      suffix={m.suffix ?? ""}
                    />
                  ) : (
                    m.display
                  )}
                  {m.unit && <span className="text-sm font-semibold text-pri">{m.unit}</span>}
                </p>
                <p className="font-monotech mt-1 text-[11px] font-bold uppercase tracking-wider text-slate-600 transition-colors group-hover:text-pri">
                  {m.label}
                </p>
              </div>
              <div className="mt-3 border-t border-slate-200/80 pt-2 font-mono text-[10px] text-slate-500">
                <span className="block text-slate-400">{m.foot}</span>
                <span className="font-bold text-slate-700">{m.footValue}</span>
              </div>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}

function StorePhilosophySection() {
  return (
    <section className="bg-white py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
          <div className="space-y-5 lg:col-span-6">
            <Reveal>
              <SectionEyebrow>Filosofi Toko Kami</SectionEyebrow>
              <h2 className="font-heading mt-2 text-2xl font-bold tracking-tight text-technavy sm:text-4xl">
                Membeli Laptop &amp; Komputer Tanpa Rasa Ragu
              </h2>
            </Reveal>
            <Reveal delayMs={150}>
              <p className="text-base leading-relaxed text-slate-600">
                Di pasar komputer second yang sering kali dipenuhi spekulasi dan ketidakpastian
                kondisi, <strong>Buana Computer Store</strong> hadir dengan standar baru: kami
                memperlakukan setiap perangkat selayaknya barang yang akan kami pakai sendiri.
              </p>
            </Reveal>
            <Reveal delayMs={250}>
              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3 transition-transform hover:translate-x-1 duration-200">
                  <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-emerald-600" />
                  <p className="text-sm text-slate-700">
                    <strong>Bebas Jebakan Kondisi:</strong> Semua foto produk adalah foto asli unit
                    yang dijual. Setiap detail spesifikasi dan histori unit disampaikan transparan.
                  </p>
                </div>
                <div className="flex items-start gap-3 transition-transform hover:translate-x-1 duration-200">
                  <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-emerald-600" />
                  <p className="text-sm text-slate-700">
                    <strong>Garansi Bertanggung Jawab:</strong> Masa garansi toko bukan sekadar
                    janji. Jika ada kendala teknis, tim kami sigap memberikan solusi perbaikan atau
                    unit pengganti.
                  </p>
                </div>
                <div className="flex items-start gap-3 transition-transform hover:translate-x-1 duration-200">
                  <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-emerald-600" />
                  <p className="text-sm text-slate-700">
                    <strong>Pilihan Fleksibel &amp; Konsultatif:</strong> Dari laptop budget 1
                    jutaan untuk sekolah hingga PC workstation multi-core untuk render 3D, semua
                    dapat didiskusikan.
                  </p>
                </div>
              </div>
            </Reveal>
            <Reveal delayMs={350}>
              <div className="pt-3">
                <Link
                  to="/"
                  className="group font-heading inline-flex items-center gap-2 rounded-xl bg-pri px-5 py-2.5 text-sm font-bold text-on-pri shadow-md transition-all duration-300 hover:bg-pri-container hover:shadow-lg hover:-translate-y-0.5 active:scale-95"
                >
                  Lihat Semua Produk di Toko
                  <ArrowRight
                    size={16}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </Link>
              </div>
            </Reveal>
          </div>

          <div className="lg:col-span-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <Reveal delayMs={100} scale>
                  <div className="group rounded-2xl border border-slate-200 bg-surface-low p-5 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-pri/40 hover:shadow-lg">
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-pri transition-transform duration-300 group-hover:scale-110 group-hover:bg-pri group-hover:text-white">
                      <Laptop size={22} />
                    </div>
                    <h3 className="font-heading text-base font-bold text-technavy transition-colors group-hover:text-pri">
                      Laptop Second Teruji
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-slate-600">
                      Grade A/B mulus, baterai prima, layar jernih, dan keyboard normal 100%.
                    </p>
                  </div>
                </Reveal>
                <Reveal delayMs={250} scale>
                  <div className="group rounded-2xl border border-slate-200 bg-surface-low p-5 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-emerald-300 hover:shadow-lg">
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 transition-transform duration-300 group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white">
                      <ShieldCheck size={22} />
                    </div>
                    <h3 className="font-heading text-base font-bold text-technavy transition-colors group-hover:text-emerald-700">
                      Garansi Toko Resmi
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-slate-600">
                      Jaminan purna jual amanah dengan nota resmi dan segel toko.
                    </p>
                  </div>
                </Reveal>
              </div>
              <div className="space-y-4 pt-6">
                <Reveal delayMs={200} scale>
                  <div className="group rounded-2xl border border-slate-200 bg-surface-low p-5 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-purple-300 hover:shadow-lg">
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600 transition-transform duration-300 group-hover:scale-110 group-hover:bg-purple-600 group-hover:text-white">
                      <Cpu size={22} />
                    </div>
                    <h3 className="font-heading text-base font-bold text-technavy transition-colors group-hover:text-purple-700">
                      Custom Rakit PC
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-slate-600">
                      Spek gaming &amp; kerja rapi, seimbang, dan lolos uji benchmark berat.
                    </p>
                  </div>
                </Reveal>
                <Reveal delayMs={350} scale>
                  <div className="group rounded-2xl border border-slate-200 bg-surface-low p-5 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-amber-300 hover:shadow-lg">
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 transition-transform duration-300 group-hover:scale-110 group-hover:bg-amber-600 group-hover:text-white">
                      <Sparkles size={22} />
                    </div>
                    <h3 className="font-heading text-base font-bold text-technavy transition-colors group-hover:text-amber-700">
                      Harga Bersahabat
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-slate-600">
                      Valuasi harga jujur dan terbaik untuk mahasiswa serta profesional Jogja.
                    </p>
                  </div>
                </Reveal>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function QualityControlSection() {
  return (
    <section className="border-t border-slate-100 bg-surface-lowest py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="mx-auto mb-12 max-w-3xl text-center sm:mb-16">
            <SectionEyebrow>Quality Control Standard</SectionEyebrow>
            <h2 className="font-heading mt-2 text-2xl font-bold tracking-tight text-technavy sm:text-4xl">
              Alur 5 Tahap Pengujian Ketat Sebelum Masuk Etalase
            </h2>
            <p className="mt-4 text-base text-slate-600">
              Tidak ada unit yang kami jual tanpa melalui serangkaian pengujian beban berat dan
              pemeriksaan komponen menyeluruh.
            </p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-5">
          {qcSteps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <Reveal key={step.step} delayMs={idx * 80}>
                <div className="group relative flex h-full flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-pri/40 hover:shadow-lg">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-monotech text-xs font-bold text-pri bg-pri/10 px-2 py-0.5 rounded">
                        STEP {step.step}
                      </span>
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-700 transition-colors group-hover:bg-pri group-hover:text-white">
                        <Icon size={16} />
                      </div>
                    </div>
                    <h3 className="font-heading mt-3 text-sm font-bold text-technavy">
                      {step.title}
                    </h3>
                    <p className="mt-2 text-xs leading-relaxed text-slate-600">{step.desc}</p>
                  </div>

                  <div className="mt-4 border-t border-slate-100 pt-3">
                    <span className="block font-mono text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded text-center">
                      ✓ {step.metric}
                    </span>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function CategoriesQuickPickSection() {
  return (
    <section className="bg-white py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12">
            <div>
              <SectionEyebrow>Kategori Produk</SectionEyebrow>
              <h2 className="font-heading mt-2 text-2xl font-bold tracking-tight text-technavy sm:text-3xl">
                Katalog Unggulan Siap Pakai di Toko
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Pilih kategori perangkat yang sesuai dengan kebutuhan kerja, hobi, dan anggaran
                Anda.
              </p>
            </div>
            <Link
              to="/"
              className="font-heading inline-flex items-center gap-1 text-xs font-bold text-pri hover:underline shrink-0"
            >
              Lihat Semua Produk ({categoriesQuickPick.length}+ Kategori)
              <ArrowRight size={14} />
            </Link>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {categoriesQuickPick.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <Reveal key={cat.title} delayMs={idx * 90}>
                <Link
                  to={cat.to}
                  className="group flex h-full flex-col justify-between rounded-3xl border border-slate-200 bg-surface-low p-6 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-pri/50 hover:shadow-xl"
                >
                  <div>
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-pri shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:bg-pri group-hover:text-white">
                      <Icon size={24} />
                    </div>
                    <span className="font-monotech text-[11px] font-bold text-pri">
                      {cat.priceRange}
                    </span>
                    <h3 className="font-heading mt-1 text-lg font-bold text-technavy group-hover:text-pri transition-colors">
                      {cat.title}
                    </h3>
                    <p className="mt-2 text-xs leading-relaxed text-slate-600">{cat.desc}</p>
                  </div>

                  <div className="mt-6 border-t border-slate-200/80 pt-4 flex items-center justify-between font-heading text-xs font-bold text-pri">
                    <span>Buka Katalog</span>
                    <ArrowRight
                      size={14}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function ComparisonTableSection() {
  return (
    <section className="border-t border-slate-100 bg-surface-lowest py-16 sm:py-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="mx-auto mb-12 max-w-3xl text-center sm:mb-14">
            <SectionEyebrow>Mengapa Memilih Kami</SectionEyebrow>
            <h2 className="font-heading mt-2 text-2xl font-bold tracking-tight text-technavy sm:text-4xl">
              Perbandingan Belanja di Buana Computer vs Penjual Anonim
            </h2>
            <p className="mt-4 text-base text-slate-600">
              Kami menjamin keamanan dan kenyamanan investasi perangkat Anda dengan standar toko
              resmi.
            </p>
          </div>
        </Reveal>

        <Reveal scale>
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-md">
            <div className="grid grid-cols-12 bg-slate-900 p-4 text-xs font-bold text-white sm:p-5">
              <div className="col-span-4 sm:col-span-3">Faktor Penilaian</div>
              <div className="col-span-8 sm:col-span-5 text-emerald-400 font-bold flex items-center gap-1.5">
                <CheckCircle2 size={16} />
                Buana Computer Store
              </div>
              <div className="hidden sm:block sm:col-span-4 text-slate-400">
                Penjual Online Anonim
              </div>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              {comparisonData.map((row) => (
                <div
                  key={row.feature}
                  className="grid grid-cols-12 items-center p-4 transition-colors hover:bg-slate-50/80 sm:p-5"
                >
                  <div className="col-span-12 mb-2 font-bold text-technavy sm:col-span-3 sm:mb-0 sm:font-semibold">
                    {row.feature}
                  </div>
                  <div className="col-span-12 text-slate-700 sm:col-span-5 flex items-start gap-2 pr-4">
                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                    <span>{row.buana}</span>
                  </div>
                  <div className="hidden sm:flex sm:col-span-4 text-slate-500 items-start gap-2 border-l border-slate-100 pl-4">
                    <XCircle size={16} className="text-rose-500 shrink-0 mt-0.5" />
                    <span>{row.other}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function StorePillarsSection() {
  return (
    <section className="bg-white py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="mx-auto mb-12 max-w-3xl text-center sm:mb-16">
            <SectionEyebrow>Kategori &amp; Layanan Utama</SectionEyebrow>
            <h2 className="font-heading mt-2 text-2xl font-bold tracking-tight text-technavy sm:text-4xl">
              Layanan Unggulan di Buana Computer Store
            </h2>
            <p className="mt-4 text-base text-slate-600">
              Fokus kami adalah menyediakan perangkat komputasi berkualitas tinggi dengan jaminan
              kenyamanan dan keamanan maksimal untuk setiap pembeli.
            </p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {pillars.map((p, idx) => {
            const Icon = p.icon;
            return (
              <Reveal key={p.code} delayMs={idx * 100}>
                <div className="group flex h-full flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-pri/40 hover:shadow-xl">
                  <div>
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-pri/10 text-pri transition-all duration-300 group-hover:scale-110 group-hover:bg-pri group-hover:text-white shadow-sm">
                      <Icon size={24} />
                    </div>
                    <span className="font-monotech text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {p.code}
                    </span>
                    <h3 className="font-heading mt-2 text-base font-bold leading-snug text-technavy transition-colors group-hover:text-pri">
                      {p.title}
                    </h3>
                    <p className="mt-3 text-xs leading-relaxed text-slate-600">{p.desc}</p>
                  </div>

                  <div className="mt-6 border-t border-slate-100 pt-4">
                    {p.to ? (
                      <Link
                        to={p.to}
                        className="font-heading inline-flex items-center gap-1.5 text-xs font-bold text-pri transition-transform group-hover:translate-x-1"
                      >
                        {p.link}
                        <ArrowRight
                          size={14}
                          className="transition-transform group-hover:translate-x-1"
                        />
                      </Link>
                    ) : (
                      <a
                        href={p.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-heading inline-flex items-center gap-1.5 text-xs font-bold text-pri transition-transform group-hover:translate-x-1"
                      >
                        {p.link}
                        <ArrowRight
                          size={14}
                          className="transition-transform group-hover:translate-x-1"
                        />
                      </a>
                    )}
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function QualityStandardsSection() {
  return (
    <section className="border-t border-slate-100 bg-surface-lowest py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="mx-auto mb-12 max-w-3xl text-center sm:mb-16">
            <SectionEyebrow>Komitmen Mutu</SectionEyebrow>
            <h2 className="font-heading mt-2 text-2xl font-bold tracking-tight text-technavy sm:text-4xl">
              6 Standar Kualitas Produk Toko Kami
            </h2>
            <p className="mt-4 text-base text-slate-600">
              Setiap unit yang keluar dari gerai Buana Computer telah memenuhi standar pengujian
              teknis yang ketat demi kepuasan jangka panjang Anda.
            </p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {standards.map((s, idx) => {
            const Icon = s.icon;
            return (
              <Reveal key={s.code} delayMs={idx * 80}>
                <div className="group h-full rounded-2xl border border-slate-200/90 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-pri/40 hover:shadow-md shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-monotech rounded-md bg-surface-low px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-pri">
                      {s.code}
                    </span>
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-pri/10 text-pri transition-transform duration-300 group-hover:scale-110 group-hover:bg-pri group-hover:text-white">
                      <Icon size={18} />
                    </div>
                  </div>
                  <h3 className="font-heading mt-3.5 text-base font-bold text-technavy transition-colors group-hover:text-pri">
                    {s.title}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-slate-600">{s.desc}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function TestimonialsMarqueeSection() {
  const reviews = [...reviewsData, ...reviewsData]; // Duplicated for smooth infinite loop

  return (
    <section className="overflow-hidden bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 mb-8">
        <Reveal>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <SectionEyebrow>Ulasan Pembeli</SectionEyebrow>
              <h2 className="font-heading mt-2 text-2xl font-bold tracking-tight text-technavy sm:text-3xl">
                Pengalaman Berbelanja di Buana Computer
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Ratusan pelanggan puas telah mempercayakan kebutuhan komputer dan laptop mereka
                kepada kami.
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <a
                href="https://www.tokopedia.com/bmccomp"
                target="_blank"
                rel="noopener noreferrer"
                className="group font-heading inline-flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-800 shadow-sm transition-all duration-300 hover:bg-emerald-100 hover:shadow"
              >
                <Store size={15} className="text-emerald-700" />
                Toko Tokopedia Kami
                <ExternalLink
                  size={13}
                  className="transition-transform group-hover:translate-x-0.5"
                />
              </a>
            </div>
          </div>
        </Reveal>
      </div>

      {/* Infinite Animated Marquee Strip */}
      <div className="group relative w-full overflow-hidden py-2">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-white to-transparent sm:w-32" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-white to-transparent sm:w-32" />

        <div className="flex w-max gap-4 animate-marquee group-hover:[animation-play-state:paused] [animation-duration:40s]">
          {reviews.map((rev, idx) => (
            <div
              key={`${rev.id}-${idx}`}
              className="flex w-[290px] sm:w-[330px] shrink-0 flex-col justify-between rounded-2xl border border-slate-200 bg-surface-low p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-pri/40 hover:shadow-md hover:bg-white"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={13} fill="currentColor" />
                    ))}
                  </div>
                  <span className="font-mono text-[10px] text-slate-400">{rev.date}</span>
                </div>
                <h4 className="font-heading mt-2.5 text-sm font-bold text-technavy line-clamp-1">
                  “{rev.title}”
                </h4>
                <p className="mt-1 text-xs leading-relaxed text-slate-600 line-clamp-3">
                  {rev.text}
                </p>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-slate-200/80 pt-3 font-mono text-[11px]">
                <span className="font-bold text-slate-800 truncate pr-2">{rev.name}</span>
                <span className="shrink-0 rounded bg-white border border-slate-200 px-2 py-0.5 text-[10px] text-slate-600 font-semibold">
                  {rev.productLabel}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function StoreVisitSection() {
  return (
    <section className="border-t border-slate-100 bg-surface-lowest py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <Reveal scale>
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10 transition-all hover:shadow-md">
            <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
              <div className="space-y-5 lg:col-span-7">
                <SectionEyebrow>Kunjungi Gerai Kami</SectionEyebrow>
                <h2 className="font-heading text-2xl font-bold tracking-tight text-technavy sm:text-3xl">
                  Alamat Gerai &amp; Jam Operasional Toko
                </h2>
                <p className="text-sm leading-relaxed text-slate-600">
                  Kami menyambut hangat kunjungan Anda untuk melihat unit langsung, berkonsultasi
                  spesifikasi, atau mencoba perangkat impian Anda di gerai kami.
                </p>

                <div className="space-y-3 pt-2">
                  <div className="flex items-start gap-3 transition-transform hover:translate-x-1 duration-200">
                    <MapPin size={18} className="mt-0.5 shrink-0 text-pri" />
                    <p className="text-xs text-slate-700 leading-relaxed">
                      <strong>Alamat Toko:</strong> Mertosan Kulon, Potorono, Kec. Banguntapan,
                      Kabupaten Bantul, Daerah Istimewa Yogyakarta 55196
                    </p>
                  </div>
                  <div className="flex items-start gap-3 transition-transform hover:translate-x-1 duration-200">
                    <Clock size={18} className="mt-0.5 shrink-0 text-pri" />
                    <div className="text-xs text-slate-700 leading-relaxed">
                      <p>
                        <strong>Senin – Sabtu:</strong> 09.00 – 20.00 WIB
                      </p>
                      <p>
                        <strong>Minggu:</strong> 10.00 – 17.00 WIB (janjian WA terlebih dahulu)
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 transition-transform hover:translate-x-1 duration-200">
                    <CreditCard size={18} className="mt-0.5 shrink-0 text-pri" />
                    <p className="text-xs text-slate-700 leading-relaxed">
                      <strong>Metode Pembayaran:</strong> Tunai (Cash), Transfer Bank (BCA, Mandiri,
                      BRI), QRIS, dan Tokopedia.
                    </p>
                  </div>
                </div>

                {/* Amenities pills */}
                <div className="pt-2">
                  <p className="font-monotech text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-2">
                    Fasilitas Gerai Toko:
                  </p>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 text-[11px] text-slate-700 font-medium">
                    {amenities.map((a) => {
                      const Icon = a.icon;
                      return (
                        <div
                          key={a.label}
                          className="flex items-center gap-1.5 rounded-lg bg-surface-low border border-slate-200/80 px-2.5 py-1.5"
                        >
                          <Icon size={14} className="text-pri shrink-0" />
                          <span className="truncate">{a.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 pt-3">
                  <a
                    href="https://maps.google.com/?q=-7.8372069,110.4148331"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group font-heading inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-800 shadow-sm transition-all duration-200 hover:bg-slate-50 hover:-translate-y-0.5"
                  >
                    <MapPin size={15} className="text-pri" />
                    Buka Google Maps
                    <ExternalLink size={12} className="text-slate-400" />
                  </a>
                  <a
                    href={WA_CONSULT}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group font-heading inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition-all duration-200 hover:bg-emerald-700 hover:-translate-y-0.5"
                  >
                    <MessageCircle size={15} />
                    Chat WhatsApp Toko
                  </a>
                </div>
              </div>

              <div className="lg:col-span-5">
                <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-md transition-transform duration-300 hover:scale-[1.01]">
                  <iframe
                    title="Peta Lokasi Buana Computer Bantul"
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3952.569472302302!2d110.41225817596045!3d-7.837206892184131!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e7a57a58c0dcdd7%3A0x6fb2a061c02da880!2sBuana%20Computer!5e0!3m2!1sid!2sid!4v1747800000000!5m2!1sid!2sid"
                    width="100%"
                    height="280"
                    style={{ border: 0 }}
                    allowFullScreen={false}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function FaqSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <section className="border-t border-slate-100 bg-surface-lowest py-16 sm:py-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="mb-10 text-center">
            <SectionEyebrow>Tanya Jawab</SectionEyebrow>
            <h2 className="font-heading mt-2 text-2xl font-bold tracking-tight text-technavy sm:text-3xl">
              Pertanyaan yang Sering Diajukan
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Hal-hal yang sering ditanyakan seputar pembelian, garansi, dan pengiriman di Buana
              Computer Store.
            </p>
          </div>
        </Reveal>

        <div className="space-y-3">
          {faqs.map((f, i) => {
            const isOpen = openIdx === i;
            return (
              <Reveal key={f.q} delayMs={i * 60}>
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:border-pri/40">
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setOpenIdx(isOpen ? null : i)}
                    className="flex w-full items-center justify-between gap-4 p-4 text-left font-heading text-sm font-bold text-technavy sm:p-5"
                  >
                    <span className="flex items-center gap-2.5">
                      <HelpCircle size={18} className="text-pri shrink-0" />
                      <span>{f.q}</span>
                    </span>
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-mono text-slate-600 transition-transform duration-300 ${
                        isOpen ? "rotate-180 bg-pri/10 text-pri" : ""
                      }`}
                    >
                      <ChevronDown size={14} />
                    </span>
                  </button>
                  {isOpen && (
                    <div className="border-t border-slate-100 px-5 pb-5 pt-3 text-xs leading-relaxed text-slate-600 animate-in fade-in duration-200">
                      {f.a}
                    </div>
                  )}
                </div>
              </Reveal>
            );
          })}
        </div>

        <Reveal delayMs={200}>
          <div className="mt-12 rounded-2xl border border-pri/20 bg-pri/5 p-6 text-center shadow-sm">
            <h3 className="font-heading text-base font-bold text-technavy">
              Masih memiliki pertanyaan seputar stok atau spek?
            </h3>
            <p className="mt-1 text-xs text-slate-600">
              Tim toko kami siap menjawab pertanyaan Anda dengan ramah dan cepat melalui WhatsApp.
            </p>
            <div className="mt-4">
              <a
                href={WA_CONSULT}
                target="_blank"
                rel="noopener noreferrer"
                className="group font-heading inline-flex items-center gap-2 rounded-xl bg-pri px-5 py-2.5 text-xs font-bold text-on-pri shadow-sm transition-all duration-300 hover:bg-pri-container hover:shadow-md hover:-translate-y-0.5 active:scale-95"
              >
                <MessageCircle size={15} />
                Hubungi WhatsApp Toko: 0859-7922-0599
                <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />
      <main>
        <AboutHero />
        <MetricsSection />
        <CategoriesQuickPickSection />
        <StorePhilosophySection />
        <QualityControlSection />
        <StorePillarsSection />
        <ComparisonTableSection />
        <QualityStandardsSection />
        <TestimonialsMarqueeSection />
        <StoreVisitSection />
        <FaqSection />
      </main>
      <SiteFooter />

      {/* Mobile Sticky Action Bar */}
      <div className="fixed bottom-0 inset-x-0 z-40 border-t border-slate-200 bg-white/95 p-2.5 shadow-lg backdrop-blur-md sm:hidden animate-in slide-in-from-bottom-2 duration-300">
        <div className="grid grid-cols-2 gap-2">
          <Link
            to="/"
            className="font-heading flex items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white py-2 text-xs font-bold text-slate-800 active:scale-95"
          >
            <ShoppingBag size={14} />
            Katalog Toko
          </Link>
          <a
            href={WA_CONSULT}
            target="_blank"
            rel="noopener noreferrer"
            className="font-heading flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 py-2 text-xs font-bold text-white shadow-sm active:scale-95"
          >
            <MessageCircle size={14} />
            Chat WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
