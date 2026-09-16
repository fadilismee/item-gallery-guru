import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "Tentang Buana Computer — Lab Servis Hardware di Bantul, Yogyakarta" },
      {
        name: "description",
        content:
          "Profil Buana Computer: lab servis mikro-elektronika, buyback hardware transparan, dan daur ulang e-waste di Banguntapan, Bantul, Yogyakarta. Cek lab 15 menit gratis. WA 6285979220599.",
      },
      {
        name: "keywords",
        content:
          "service laptop bantul, bengkel komputer bantul, service komputer yogyakarta, repair motherboard, micro soldering jogja, lab elektronik yogyakarta, buana computer",
      },
      {
        property: "og:title",
        content: "Tentang Buana Computer — Lab Servis Hardware Bantul",
      },
      {
        property: "og:description",
        content:
          "Membangun ekosistem hardware sirkular & riset presisi: transparansi meja periksa 100%, rekayasa mikro-elektronika bergaransi, dan fasilitas penyelamatan e-waste.",
      },
      { property: "og:image", content: "https://buanacomputer.web.id/Buanacomputer-logo.png" },
      { property: "og:url", content: "https://buanacomputer.web.id/about" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://buanacomputer.web.id/about" }],
  }),
  component: AboutPage,
});

const WA_CONSULT =
  "https://wa.me/6285979220599?text=Halo%20Buana%20Computer%2C%20saya%20mau%20konsultasi%20servis";

const heroBadges = [
  { title: "Lab Standar Industri ESD-4", dot: "bg-pri-container" },
  { title: "Transparansi Meja Terbuka (Zero Hidden-Fix)", dot: "bg-sec-container" },
  { title: "Zero-Waste Component Salvage", dot: "bg-emerald-400" },
];

const metrics = [
  {
    value: "5.200+",
    unit: "",
    label: "Perangkat Tertangani",
    foot: "Success Rate",
    footValue: "94% Tanpa Ganti Total",
  },
  {
    value: "1.840+",
    unit: "",
    label: "Komponen Diselamatkan",
    foot: "Diversi TPA",
    footValue: ">1.8 Ton E-Waste",
  },
  {
    value: "99.2",
    unit: "%",
    label: "Indeks Kepuasan",
    foot: "Google Review",
    footValue: "★ 4.9/5.0",
  },
  {
    value: "15",
    unit: " Mnt",
    label: "Live Diagnosis Awal",
    foot: "Voltage Rail Check",
    footValue: "Di Depan Klien",
  },
  {
    value: "100",
    unit: "%",
    label: "Sanitasi Data Militer",
    foot: "Standar Keamanan",
    footValue: "NIST 800-88",
  },
  {
    value: "25+",
    unit: "",
    label: "Jejaring Bengkel Mitra",
    foot: "Cakupan Area",
    footValue: "DIY & Solo Raya",
  },
];

const pillars = [
  {
    code: "PILAR 01 — REPAIR LAB",
    title: "Laboratorium Mikro-Elektronika & Reparasi Presisi",
    desc: "Layanan servis micro-soldering BGA, penggantian shorted MOSFET, pemulihan motherboard korosi cairan, thermal rebuild GPU, dan re-programming chip BIOS menggunakan mikroskop trinokular stereo dan kamera FLIR.",
    link: "Jelajahi Lab Servis Presisi",
    to: "/blog",
  },
  {
    code: "PILAR 02 — CIRCULAR BUYBACK",
    title: "Buyback & Sirkularitas Kanibalan Terbuka",
    desc: "Menerima laptop & PC mati dengan skema penaksiran transparan berbasis nilai riil komponen: IC salvageable, modul RAM, heatsink tembaga murni, dan panel layar.",
    link: "Cek Price List Terima Hardware",
    to: "/jual",
  },
  {
    code: "PILAR 03 — OPEN JOURNAL",
    title: "Buana Journal & Edukasi Terbuka",
    desc: "Pusat publikasi artikel teknikal mendalam: diagram kelistrikan motherboard, teardown arsitektur laptop baru, panduan thermal pad, dan literasi sanitasi data sebelum menjual perangkat.",
    link: "Baca Riset Buana Journal",
    to: "/blog",
  },
];

const standards = [
  {
    code: "STANDARD-01",
    title: "ESD Level 4 Protected",
    desc: "Meja mat antistatik ber-grounding aman dari sengatan listrik statis tak kasat mata saat perbaikan IC.",
  },
  {
    code: "STANDARD-02",
    title: "Zero-Malpractice Policy",
    desc: "Tidak ada swap komponen diam-diam. Seluruh part rusak lama selalu diserahkan kembali kepada pemilik.",
  },
  {
    code: "STANDARD-03",
    title: "NIST 800-88 Data Sanitization",
    desc: "Pembersihan data drive bekas secara militer (multi-pass overwrite) sebelum unit dilebur atau dijual kanibal.",
  },
  {
    code: "STANDARD-04",
    title: "Fair Salvage Scoring",
    desc: "Penaksiran hardware rusak memakai kalkulasi sisa siklus kerja IC riil, bukan tebakan sepihak penadah.",
  },
  {
    code: "STANDARD-05",
    title: "Zero-Waste DIY Pioneer",
    desc: "Memilah sisa timah solder dan heatsink aluminium/tembaga ke mitra peleburan daur ulang bersertifikat.",
  },
  {
    code: "STANDARD-06",
    title: "15-Min Live Inspection",
    desc: "Pengecekan voltase rail 3.3V, 5V, 12V dan short circuit langsung di depan mata Anda tanpa biaya tersembunyi.",
  },
];

const impacts = [
  {
    seed: "buana-salvage",
    badge: "SALVAGE HUB",
    eyebrow: "Circular Economy",
    title: "Menyelamatkan 1.800+ Part dari TPA",
    desc: "Komponen IC power, MOSFET, dan heatsink tembaga dipilah teliti untuk perbaikan berbiaya terjangkau bagi civitas kampus.",
    foot: "Status:",
    footValue: "Tersimpan di Bin ESD",
  },
  {
    seed: "buana-vokasi",
    badge: "VOCATIONAL LAB",
    eyebrow: "Talenta Vokasi",
    title: "Keahlian Mikro-Elektronika untuk Talenta Lokal",
    desc: "Membuka magang terstruktur BGA rework & reballing bagi siswa SMK dan mahasiswa teknik elektro di DIY.",
    foot: "Kurikulum:",
    footValue: "IPC-7711/7721 Guide",
  },
  {
    seed: "buana-termal",
    badge: "THERMAL BENCH",
    eyebrow: "Akurasi Lab",
    title: "Diagnosa Termal Akurat Tanpa Tebak-Tebakan",
    desc: "Kamera inframerah membaca perbedaan suhu milikelvin untuk mendeteksi short-circuit pada jalur VCore CPU dan VRAM GPU.",
    foot: "Resolusi:",
    footValue: "<0.05°C NETD FLIR",
  },
  {
    seed: "buana-klien",
    badge: "CLIENT BENCH",
    eyebrow: "Transparansi Klien",
    title: "Konsultasi Terbuka Tanpa Bahasa Nakut-nakuti",
    desc: "Estimasi biaya disampaikan terbuka di hadapan konsumen lengkap dengan skematik diagram motherboard yang ditangani.",
    foot: "Biaya Cek:",
    footValue: "Rp 0 (Transparan)",
  },
];

const benches = [
  {
    tag: "OSCILLOSCOPE",
    code: "BENCH-01",
    title: "Rigol DS1054Z 4-Channel Digital",
    desc: "Menganalisis sinyal clock PWM, clock generator motherboard, dan kestabilan rail tegangan VCore real-time.",
    spec: "Spesifikasi: 50MHz-100MHz | 1 GSa/s Real-time",
  },
  {
    tag: "THERMOGRAPHY",
    code: "BENCH-02",
    title: "FLIR E8-XT High-Res Infrared Camera",
    desc: "Mendeteksi titik shorted capacitor & MOSFET di bawah heatsink tanpa harus melepas seluruh modul.",
    spec: "Spesifikasi: 320x240 IR | MSX Dynamic Thermal Blend",
  },
  {
    tag: "MICRO-SOLDERING",
    code: "BENCH-03",
    title: "JBC CD-2BQF High Precision Station",
    desc: "Solder mikro dengan thermal recovery super kilat (2 detik) khusus jalur PCB 0.1mm dan SMD 0201.",
    spec: "Spesifikasi: C245 Cartridges | Micro-Sleep Sensor",
  },
  {
    tag: "BGA REWORK",
    code: "BENCH-04",
    title: "Hakko FR-810B Digital Hot Air Station",
    desc: "Suhu terkontrol dengan profil pemanasan bertahap untuk mengangkat chip VRAM GDDR6 dan IC chipset.",
    spec: "Spesifikasi: High-volume airflow | Thermal Profiling",
  },
  {
    tag: "OPTICS",
    code: "BENCH-05",
    title: "AmScope 7X-45X Trinocular Stereo Zoom",
    desc: "Visualisasi jalur tembaga putus dan solder bridge mikro yang disambungkan ke monitor untuk disaksikan konsumen.",
    spec: "Spesifikasi: 1080p HDMI Sensor | 144-LED Ring Light",
  },
  {
    tag: "POWER BENCH",
    code: "BENCH-06",
    title: "Korad Programmable DC Power Sequencing",
    desc: "Injeksi tegangan rendah dengan pembatas arus untuk isolasi short-circuit tanpa merusak prosesor utama.",
    spec: "Spesifikasi: 30V / 5A | 1mV / 1mA Resolution",
  },
];

const faqs = [
  {
    q: "Apakah diagnosa awal benar-benar gratis?",
    a: "Ya. Pengecekan voltase rail 3.3V, 5V, 12V dan deteksi short-circuit selama ±15 menit dilakukan di meja terbuka tanpa biaya — Anda baru membayar jika sepakat lanjut ke tahap perbaikan.",
  },
  {
    q: "Bagaimana saya tahu komponen saya tidak ditukar?",
    a: "Semua pembongkaran dilakukan di meja kaca yang bisa Anda saksikan langsung. Part lama yang diganti selalu dikembalikan ke pemilik, dan setiap tahap difoto sebagai dokumentasi servis.",
  },
  {
    q: "Apakah menerima laptop/PC mati total untuk dibeli (buyback)?",
    a: "Tentu. Unit mati total tetap bernilai sebagai donor IC, VRAM, heatsink, dan panel. Lihat price list lengkap di halaman Jual — taksirannya transparan berbasis grade kondisi.",
  },
  {
    q: "Bagaimana keamanan data di SSD/HDD yang saya jual atau servis?",
    a: "Kami menerapkan sanitasi data standar NIST 800-88 (multi-pass overwrite). Untuk unit yang dijual, proses wipe bisa disaksikan langsung hingga data tidak dapat di-recovery.",
  },
];

function SectionEyebrow({ children, light }: { children: string; light?: boolean }) {
  return (
    <span
      className={`font-monotech text-[11px] font-bold uppercase tracking-widest ${light ? "text-brand-200" : "text-brand-600"}`}
    >
      {children}
    </span>
  );
}

function AboutHero() {
  return (
    <section className="relative flex items-center justify-center overflow-hidden bg-techdark pb-24 pt-12 text-white">
      <div className="absolute inset-0">
        <img
          src="https://picsum.photos/seed/buana-lab/1600/900"
          alt="Meja kerja laboratorium Buana Computer"
          className="h-full w-full object-cover opacity-35 contrast-125 saturate-75"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-techdark via-techdark/80 to-techdark/60" />
        <div className="absolute inset-0 bg-gradient-to-r from-techdark via-transparent to-techdark" />
      </div>
      <div className="relative z-10 mx-auto max-w-5xl px-4 text-center sm:px-6">
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-4 py-1.5 font-monotech text-xs uppercase tracking-wider text-brand-200 backdrop-blur-md">
          <span className="h-2 w-2 animate-pulse rounded-full bg-brand-500" />
          Tentang Buana Computer • Yogyakarta
        </div>
        <h1 className="font-heading text-3xl font-bold leading-[1.15] tracking-tight sm:text-5xl lg:text-6xl">
          Membangun Ekosistem Hardware Sirkular &amp;{" "}
          <span className="bg-gradient-to-r from-brand-200 via-sky-300 to-teal-200 bg-clip-text text-transparent">
            Riset Presisi Pertama di Indonesia
          </span>
        </h1>
        <p className="mx-auto mb-12 mt-6 max-w-3xl text-base leading-relaxed text-slate-300 sm:text-xl">
          Kami meredefinisi industri komputasi dari akar: menghentikan vonis mati sepihak laptop
          &amp; PC melalui transparansi meja periksa 100%, rekayasa mikro-elektronika bergaransi,
          dan fasilitas penyelamatan e-waste ramah lingkungan di Yogyakarta.
        </p>
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-center gap-3 sm:gap-4">
          {heroBadges.map((b) => (
            <div
              key={b.title}
              className="flex items-center gap-2.5 rounded-xl border border-white/15 bg-white/10 px-4 py-2 font-monotech text-xs text-slate-200 backdrop-blur-md"
            >
              <span className={`h-2 w-2 rounded-full ${b.dot}`} />
              {b.title}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TopologySection() {
  return (
    <section className="border-b border-slate-100 bg-white py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-12 max-w-3xl text-center sm:mb-16">
          <SectionEyebrow>Tantangan Kami</SectionEyebrow>
          <h2 className="font-heading mt-2 text-3xl font-bold tracking-tight text-technavy sm:text-4xl">
            Melawan Stigma Servis Gelap &amp; Penumpukan E-Waste Komputer
          </h2>
          <p className="mt-5 text-base leading-relaxed text-slate-600">
            Ketiadaan fasilitas diagnosa tingkat mikron membuat ratusan ribu laptop setiap tahun
            divonis mati total. Akibatnya, jutaan komponen fungsional terbuang ke TPA tanpa sanitasi
            data maupun daur ulang yang layak.
          </p>
        </div>
        <div className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-surface-low p-6 shadow-sm sm:p-10">
          <div className="mb-6 flex flex-col gap-4 border-b border-slate-200/80 pb-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="font-monotech block text-[11px] font-bold uppercase tracking-wider text-brand-600">
                Yogyakarta Circular Tech Topology
              </span>
              <h3 className="font-heading text-lg font-bold text-technavy">
                Sentra Laboratorium Banguntapan &amp; Koridor Pemulihan Komponen
              </h3>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 font-monotech text-xs text-slate-600 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Sistem Operasional Real-time Aktif
            </div>
          </div>
          <svg
            viewBox="0 0 900 320"
            className="h-auto w-full"
            role="img"
            aria-label="Peta jaringan sirkular Buana Computer"
          >
            <path
              d="M60 90 Q 250 50 450 70 T 850 80"
              stroke="#dae2fd"
              strokeDasharray="6 6"
              strokeWidth="1.5"
              fill="none"
            />
            <path
              d="M70 210 Q 260 170 470 190 T 850 180"
              stroke="#dae2fd"
              strokeDasharray="6 6"
              strokeWidth="1.5"
              fill="none"
            />
            <path
              d="M90 290 Q 300 270 520 280 T 840 295"
              stroke="#dae2fd"
              strokeDasharray="6 6"
              strokeWidth="1.5"
              fill="none"
            />
            <path
              d="M200 175 C 280 120, 370 125, 440 160"
              stroke="#0066ff"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M460 160 C 550 105, 640 115, 705 135"
              stroke="#0066ff"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M450 165 C 420 230, 360 250, 320 260"
              stroke="#00d2ff"
              strokeWidth="2"
              strokeDasharray="5 5"
              fill="none"
            />
            <path
              d="M460 165 C 540 225, 600 245, 660 240"
              stroke="#10b981"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
            />
            <g>
              <circle cx="200" cy="175" r="14" fill="#0066ff" fillOpacity="0.15" />
              <circle cx="200" cy="175" r="7" fill="#0066ff" />
              <rect x="110" y="115" width="180" height="38" rx="8" fill="white" stroke="#c2c6d8" />
              <text
                x="200"
                y="131"
                textAnchor="middle"
                fontFamily="'Space Grotesk',sans-serif"
                fontSize="11"
                fontWeight="700"
                fill="#0f172a"
              >
                Sleman &amp; Kampus Hub
              </text>
              <text
                x="200"
                y="144"
                textAnchor="middle"
                fontFamily="'JetBrains Mono',monospace"
                fontSize="9"
                fill="#64748b"
              >
                24 Jam Drop Point Mahasiswa
              </text>
            </g>
            <g>
              <circle cx="450" cy="160" r="30" fill="#0066ff" fillOpacity="0.12" />
              <circle cx="450" cy="160" r="17" fill="#0066ff" fillOpacity="0.25" />
              <circle cx="450" cy="160" r="9" fill="#0066ff" />
              <circle cx="450" cy="160" r="4" fill="#ffffff" />
              <rect
                x="350"
                y="60"
                width="200"
                height="52"
                rx="10"
                fill="#0f172a"
                stroke="#0066ff"
                strokeWidth="1.5"
              />
              <text
                x="450"
                y="82"
                textAnchor="middle"
                fontFamily="'Space Grotesk',sans-serif"
                fontSize="12"
                fontWeight="700"
                fill="#ffffff"
              >
                HQ Banguntapan Research Lab
              </text>
              <text
                x="450"
                y="97"
                textAnchor="middle"
                fontFamily="'JetBrains Mono',monospace"
                fontSize="9"
                fill="#60a5fa"
              >
                Sentra Micro-Soldering &amp; Teardown
              </text>
            </g>
            <g>
              <circle cx="320" cy="265" r="12" fill="#00d2ff" fillOpacity="0.25" />
              <circle cx="320" cy="265" r="6" fill="#0099cc" />
              <rect x="235" y="283" width="170" height="30" rx="6" fill="white" stroke="#cbd5e1" />
              <text
                x="320"
                y="302"
                textAnchor="middle"
                fontFamily="'Space Grotesk',sans-serif"
                fontSize="10"
                fontWeight="700"
                fill="#0f172a"
              >
                Bantul &amp; Salvage Depot
              </text>
            </g>
            <g>
              <circle cx="710" cy="138" r="14" fill="#0066ff" fillOpacity="0.15" />
              <circle cx="710" cy="138" r="7" fill="#0066ff" />
              <rect x="625" y="82" width="170" height="38" rx="8" fill="white" stroke="#c2c6d8" />
              <text
                x="710"
                y="98"
                textAnchor="middle"
                fontFamily="'Space Grotesk',sans-serif"
                fontSize="11"
                fontWeight="700"
                fill="#0f172a"
              >
                Solo Raya &amp; Jateng Koridor
              </text>
              <text
                x="710"
                y="111"
                textAnchor="middle"
                fontFamily="'JetBrains Mono',monospace"
                fontSize="9"
                fill="#64748b"
              >
                25+ Mitra Servis Terverifikasi
              </text>
            </g>
            <g>
              <circle cx="665" cy="242" r="14" fill="#10b981" fillOpacity="0.18" />
              <circle cx="665" cy="242" r="7" fill="#10b981" />
              <rect x="580" y="262" width="170" height="34" rx="8" fill="white" stroke="#a7f3d0" />
              <text
                x="665"
                y="277"
                textAnchor="middle"
                fontFamily="'Space Grotesk',sans-serif"
                fontSize="11"
                fontWeight="700"
                fill="#065f46"
              >
                Fasilitas Peleburan Tembaga
              </text>
              <text
                x="665"
                y="289"
                textAnchor="middle"
                fontFamily="'JetBrains Mono',monospace"
                fontSize="9"
                fill="#047857"
              >
                Zero Toxic Residue Protocol
              </text>
            </g>
          </svg>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-4 border-t border-slate-200/80 pt-4 text-xs">
            <div className="flex flex-wrap items-center gap-6">
              <span className="inline-flex items-center gap-2 font-medium text-slate-700">
                <span className="h-3 w-3 rounded-full bg-brand-500 ring-2 ring-brand-200" /> Lab
                Sentral Transparan
              </span>
              <span className="inline-flex items-center gap-2 font-medium text-slate-700">
                <span className="h-3 w-3 rounded-full bg-sky-400" /> Drop-point Kampus &amp; Bantul
              </span>
              <span className="inline-flex items-center gap-2 font-medium text-slate-700">
                <span className="h-3 w-3 rounded-full bg-emerald-500" /> Kanal Daur Ulang &amp;
                Zero-Waste
              </span>
            </div>
            <div className="font-monotech text-[11px] text-slate-500">
              Kapasitas Lab: 120+ Motherboard / Minggu
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function MissionSection() {
  return (
    <section className="relative overflow-hidden bg-surface py-16 sm:py-24">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 sm:px-6 lg:grid-cols-12 lg:gap-16 lg:px-8">
        <div className="grid grid-cols-2 gap-4 lg:col-span-6">
          <div className="space-y-4">
            <div className="group relative overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
              <img
                src="https://picsum.photos/seed/buana-timlab/640/640"
                alt="Tim teknisi Buana Computer di meja riset"
                loading="lazy"
                className="h-64 w-full object-cover transition-transform duration-500 group-hover:scale-105 sm:h-72"
              />
              <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-md bg-technavy/80 px-2.5 py-1 font-monotech text-[11px] text-white backdrop-blur-md">
                <span className="h-2 w-2 rounded-full bg-emerald-400" /> Live Workbench
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-1 flex items-center justify-between">
                <span className="font-heading text-2xl font-bold text-brand-600">100%</span>
                <span className="font-monotech rounded bg-brand-50 px-2 py-0.5 text-xs text-brand-700">
                  TERVERIFIKASI
                </span>
              </div>
              <h4 className="font-heading text-sm font-bold text-technavy">
                Komitmen Transparansi di Depan Pemilik
              </h4>
              <p className="mt-1 text-xs leading-normal text-slate-500">
                Klien menyaksikan pembongkaran casing dan pengukuran multimeter di meja kaca secara
                langsung.
              </p>
            </div>
          </div>
          <div className="space-y-4 pt-6 sm:pt-10">
            <div className="rounded-2xl border border-brand-100 bg-gradient-to-br from-brand-50 to-white p-5 shadow-sm">
              <h4 className="font-heading text-sm font-bold text-brand-900">
                Perbaikan Tingkat Komponen
              </h4>
              <p className="mt-1 text-xs leading-normal text-brand-700">
                Mengganti kapasitor bocor, MOSFET jebol, atau chip PWM daripada ganti logic-board
                utuh.
              </p>
            </div>
            <div className="group relative overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
              <img
                src="https://picsum.photos/seed/buana-konsul/640/640"
                alt="Konsultasi terbuka teknisi Buana Computer dengan pengunjung"
                loading="lazy"
                className="h-64 w-full object-cover transition-transform duration-500 group-hover:scale-105 sm:h-72"
              />
              <div className="absolute bottom-3 left-3 right-3 rounded-xl border border-slate-200/80 bg-white/90 p-2.5 text-[11px] font-medium text-slate-800 backdrop-blur-md">
                Meja Konsultasi Terbuka Banguntapan
              </div>
            </div>
          </div>
        </div>
        <div className="space-y-6 lg:col-span-6">
          <div>
            <SectionEyebrow>Misi &amp; Kredibilitas Meja Kerja</SectionEyebrow>
            <h2 className="font-heading mt-2 text-3xl font-bold leading-tight tracking-tight text-technavy sm:text-4xl">
              Membongkar Tabir Servis Gelap, Menghargai Setiap Silikon Hardware
            </h2>
          </div>
          <p className="text-base leading-relaxed text-slate-600">
            Buana Computer lahir dari keprihatinan atas praktik umum industri bengkel komputer:
            diagnosa mengambang, pembengkakan estimasi sepihak, hingga tuduhan palsu kerusakan
            komponen. Kami percaya masyarakat dan civitas akademika berhak atas kejujuran data
            teknis.
          </p>
          <p className="text-base leading-relaxed text-slate-600">
            Melalui etos kerja laboratorium berbasis bukti — osiloskop pembaca clock, kamera termal
            inframerah, dan mikroskop stereo trinokular — kami mengidentifikasi kerusakan hingga
            tingkat mikron, mengutamakan penyelamatan komponen donor agar biaya tetap terjangkau.
          </p>
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <a
              href="#ekosistem"
              className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-brand-500/20 transition-all hover:bg-brand-600"
            >
              Pelajari 3 Pilar Ekosistem <span aria-hidden>→</span>
            </a>
            <a
              href="#fasilitas"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 transition-all hover:border-slate-400 hover:bg-white"
            >
              Peralatan Uji Lab
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function MetricsSection() {
  return (
    <section className="border-y border-slate-200 bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative grid grid-cols-1 items-center gap-12 overflow-hidden rounded-3xl border border-slate-200 bg-surface-low p-8 sm:p-12 lg:grid-cols-12 lg:p-16">
          <div className="relative z-10 space-y-4 lg:col-span-5">
            <div className="inline-flex items-center gap-2 rounded-md bg-brand-100 px-3 py-1 font-monotech text-xs font-semibold uppercase text-brand-700">
              Audited Performance
            </div>
            <h2 className="font-heading text-3xl font-bold tracking-tight text-technavy sm:text-4xl">
              Dampak Kuantitatif dan Rekam Jejak Lapangan
            </h2>
            <p className="text-sm leading-relaxed text-slate-600 sm:text-base">
              Metrik operasional riil laboratorium Buana Computer dalam melayani mahasiswa,
              profesional kreatif, instansi riset kampus, dan pelaku UMKM di DIY &amp; Jawa Tengah.
            </p>
          </div>
          <div className="relative z-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:col-span-7 lg:grid-cols-3">
            {metrics.map((m) => (
              <div
                key={m.label}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="font-heading flex items-baseline text-3xl font-bold text-technavy">
                  {m.value}
                  <span className="text-xl font-bold text-brand-500">{m.unit}</span>
                </div>
                <p className="mt-1 text-xs font-semibold text-slate-800">{m.label}</p>
                <div className="font-monotech mt-3 flex items-center justify-between border-t border-slate-100 pt-2 text-[11px] text-slate-500">
                  <span>{m.foot}</span>
                  <span className="font-bold text-emerald-600">{m.footValue}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function PillarsSection() {
  return (
    <section id="ekosistem" className="scroll-mt-24 bg-surface py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-12 max-w-2xl text-center sm:mb-16">
          <SectionEyebrow>Arsitektur Bisnis &amp; Sirkular</SectionEyebrow>
          <h2 className="font-heading mt-2 text-3xl font-bold tracking-tight text-technavy sm:text-4xl">
            3 Pilar Utama Ekosistem Komputasi Buana
          </h2>
          <p className="mt-3 text-sm text-slate-600">
            Tiga simpul terintegrasi yang memastikan siklus pakai hardware diperpanjang dengan aman,
            etis, dan transparan.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {pillars.map((p) => (
            <div
              key={p.code}
              className="group flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-8 transition-all hover:border-brand-500 hover:shadow-xl hover:shadow-brand-500/5"
            >
              <div>
                <div className="font-monotech mb-3 inline-block rounded-md bg-brand-50 px-2.5 py-1 text-[11px] font-bold text-brand-600">
                  {p.code}
                </div>
                <h3 className="font-heading mb-3 text-xl font-bold text-technavy">{p.title}</h3>
                <p className="mb-6 text-sm leading-relaxed text-slate-600">{p.desc}</p>
              </div>
              <div className="border-t border-slate-100 pt-4">
                <Link
                  to={p.to}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 transition-transform group-hover:translate-x-1.5"
                >
                  {p.link} <span aria-hidden>→</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function StandardsSection() {
  return (
    <section className="relative overflow-hidden bg-techdark py-16 text-white sm:py-24">
      <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-brand-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-teal-500/10 blur-3xl" />
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-12 max-w-2xl text-center sm:mb-16">
          <SectionEyebrow light>Standar Kerja &amp; Integritas Kami</SectionEyebrow>
          <h2 className="font-heading mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Disiplin Laboratorium Tanpa Kompromi
          </h2>
          <p className="mt-3 text-sm text-slate-400">
            Setiap unit diuji dengan protokol ketat setara standar industri manufaktur sebelum
            kembali ke tangan pemiliknya.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {standards.map((s) => (
            <div
              key={s.code}
              className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-colors hover:border-brand-500/50"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-brand-500/40 bg-brand-500/20 font-monotech text-sm font-bold text-brand-200">
                {s.code.replace("STANDARD-", "")}
              </div>
              <div>
                <span className="font-monotech mb-1 inline-block rounded bg-brand-500/20 px-2 py-0.5 text-[10px] font-bold text-brand-200">
                  {s.code}
                </span>
                <h4 className="font-heading text-base font-bold">{s.title}</h4>
                <p className="mt-1 text-xs leading-relaxed text-slate-400">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ImpactSection() {
  return (
    <section className="bg-white py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-12 max-w-2xl text-center sm:mb-16">
          <SectionEyebrow>Dokumentasi Riil Lapangan</SectionEyebrow>
          <h2 className="font-heading mt-2 text-3xl font-bold tracking-tight text-technavy sm:text-4xl">
            Dampak dari Komitmen Sirkular Buana Computer
          </h2>
          <p className="mt-3 text-sm text-slate-600">
            Potret kegiatan teknisi, pemilahan limbah e-waste, dan pengujian termal di studio kami.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {impacts.map((c) => (
            <div
              key={c.seed}
              className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-surface-low shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="relative h-52 overflow-hidden">
                <img
                  src={`https://picsum.photos/seed/${c.seed}/600/400`}
                  alt={c.title}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                />
                <span className="font-monotech absolute left-3 top-3 rounded bg-technavy/80 px-2 py-0.5 text-[10px] text-emerald-300 backdrop-blur-md">
                  {c.badge}
                </span>
              </div>
              <div className="flex flex-1 flex-col justify-between p-5">
                <div>
                  <span className="font-monotech mb-1 block text-[11px] font-bold uppercase tracking-wider text-brand-600">
                    {c.eyebrow}
                  </span>
                  <h4 className="font-heading mb-2 text-base font-bold text-technavy">{c.title}</h4>
                  <p className="text-xs leading-relaxed text-slate-600">{c.desc}</p>
                </div>
                <div className="font-monotech mt-4 flex items-center justify-between border-t border-slate-200/80 pt-4 text-[11px] text-slate-500">
                  <span>{c.foot}</span>
                  <span className="font-semibold text-slate-800">{c.footValue}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function LabFacilitySection() {
  return (
    <section
      id="fasilitas"
      className="scroll-mt-24 border-t border-slate-200 bg-surface-low py-16 sm:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-12 max-w-2xl text-center sm:mb-16">
          <SectionEyebrow>Peralatan Riset &amp; Uji Standar Tinggi</SectionEyebrow>
          <h2 className="font-heading mt-2 text-3xl font-bold tracking-tight text-technavy sm:text-4xl">
            Inventaris Peralatan Uji Laboratorium Buana
          </h2>
          <p className="mt-3 text-sm text-slate-600">
            Kami menolak diagnosa tebak-tebakan. Seluruh meja servis dilengkapi instrumentasi
            presisi standar laboratorium industri elektronika.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {benches.map((b) => (
            <div
              key={b.code}
              className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <span className="font-monotech rounded bg-brand-50 px-2.5 py-1 text-xs font-bold text-brand-600">
                    {b.tag}
                  </span>
                  <span className="font-monotech text-xs text-slate-400">{b.code}</span>
                </div>
                <h4 className="font-heading mb-1 text-base font-bold text-technavy">{b.title}</h4>
                <p className="mb-4 text-xs leading-relaxed text-slate-500">{b.desc}</p>
              </div>
              <div className="font-monotech rounded-lg bg-slate-50 p-2.5 text-[11px] text-slate-600">
                {b.spec}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FaqSection() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <div className="mb-10 space-y-2 text-center">
          <span className="font-monotech text-xs font-semibold uppercase tracking-widest text-pri">
            Tanya Jawab Seputar Buana Computer
          </span>
          <h2 className="font-heading text-3xl font-bold tracking-tight text-on-surface sm:text-4xl">
            Frequently Asked Questions
          </h2>
        </div>
        <div className="space-y-3">
          {faqs.map((f, i) => {
            const isOpen = open === i;
            return (
              <div key={f.q} className="overflow-hidden rounded-xl bg-surface-low shadow-sm">
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center justify-between px-5 py-4 text-left font-heading text-base font-semibold text-on-surface transition-colors hover:text-pri"
                  aria-expanded={isOpen}
                >
                  <span>{f.q}</span>
                  <span
                    className={`ml-4 shrink-0 text-xl text-outline transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                    aria-hidden
                  >
                    ⌄
                  </span>
                </button>
                {isOpen && (
                  <p className="px-5 pb-4 text-sm leading-relaxed text-on-surface-variant">{f.a}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function VisitCta() {
  return (
    <section className="border-t border-slate-200 bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative grid grid-cols-1 items-center gap-10 overflow-hidden rounded-3xl bg-gradient-to-br from-technavy via-slate-900 to-techdark p-8 text-white shadow-2xl sm:p-14 lg:grid-cols-12">
          <div className="pointer-events-none absolute -right-16 -top-16 h-80 w-80 rounded-full bg-brand-500/20 blur-3xl" />
          <div className="relative z-10 space-y-4 lg:col-span-7">
            <SectionEyebrow light>Kunjungi Workshop atau Konsultasikan via Daring</SectionEyebrow>
            <h2 className="font-heading text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
              Punya Laptop/PC Bermasalah atau Hardware Bekas yang Ingin Diselamatkan?
            </h2>
            <p className="max-w-xl text-sm leading-relaxed text-slate-300 sm:text-base">
              Datang langsung ke Lab Banguntapan untuk live-check 15 menit tanpa biaya, atau
              kirimkan foto spesifikasi unit bekas Anda untuk penaksiran harga buyback transparan.
            </p>
            <div className="font-monotech flex flex-wrap items-center gap-x-6 gap-y-2 pt-2 text-xs text-slate-400">
              <span>Mertosan Kulon, Potorono, Banguntapan, Bantul 55196</span>
              <span>Senin – Sabtu: 09.00 – 20.00 WIB</span>
            </div>
          </div>
          <div className="relative z-10 flex flex-col gap-4 sm:flex-row lg:col-span-5 lg:flex-col">
            <a
              href={WA_CONSULT}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 rounded-xl bg-brand-500 px-6 py-4 text-center text-sm font-semibold text-white shadow-lg shadow-brand-500/30 transition-all hover:bg-brand-600"
            >
              Konsultasi Servis Langsung
            </a>
            <Link
              to="/jual"
              className="flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-6 py-4 text-center text-sm font-semibold text-white backdrop-blur-md transition-all hover:bg-white/15"
            >
              Taksir &amp; Jual Komputer Rusak (Buyback)
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />
      <AboutHero />
      <TopologySection />
      <MissionSection />
      <MetricsSection />
      <PillarsSection />
      <StandardsSection />
      <ImpactSection />
      <LabFacilitySection />
      <FaqSection />
      <VisitCta />
      <SiteFooter />
    </div>
  );
}
