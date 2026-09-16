import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  BadgeCheck,
  Banknote,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircuitBoard,
  ClipboardCheck,
  Info,
  Laptop,
  MemoryStick,
  MessageCircle,
  Recycle,
  Search,
  Store,
  Truck,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import jualAssets from "@/data/jualAssets.json";
import {
  buybackCategoryMeta,
  buybackItems,
  type BuybackCategory,
  type BuybackItem,
} from "@/data/sellPrices";

export const Route = createFileRoute("/jual/")({
  head: () => ({
    meta: [
      {
        title: "Jual Laptop Bekas & Hardware Rusak Harga Terbaik — Buana Computer Bantul",
      },
      {
        name: "description",
        content:
          "Jual laptop bekas, laptop rusak, motherboard, VGA, RAM & SSD ke Buana Computer Bantul, Yogyakarta. Price list buyback transparan, cek lab 15 menit, dana cair instan. WA 6285979220599.",
      },
      {
        name: "keywords",
        content:
          "jual laptop bekas, jual laptop rusak, harga beli laptop mati, jual motherboard rusak, jual vga rusak, jual rongsokan komputer, buyback hardware bantul, tukar tambah laptop yogyakarta",
      },
      {
        property: "og:title",
        content: "Jual Hardware Bekas & Rusak Jadi Rupiah — Buana Computer Bantul",
      },
      {
        property: "og:description",
        content:
          "Daripada jadi rongsokan, tukar hardware Anda menjadi rupiah. Terima laptop, PC, motherboard, VGA normal, rusak & matot — taksiran transparan, cair instan.",
      },
      { property: "og:image", content: "https://buanacomputer.web.id/Buanacomputer-logo.png" },
      { property: "og:url", content: "https://buanacomputer.web.id/jual" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://buanacomputer.web.id/jual" }],
  }),
  component: JualPage,
});

const WA_NUMBER = "6285979220599";
const WA_TRADEIN = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent("Halo Buana Computer, saya ingin tukar tambah hardware lama")}`;

const grades = [
  {
    code: "GRADE A",
    range: "70% - 85% Pasar",
    title: "Normal & Mulus",
    desc: "Kondisi siap pakai, lengkap dos/box ori, segel garansi pabrik utuh, performa benchmark stabil 100% tanpa throttle.",
    foot: "Valuasi Paling Maksimal",
    codeClass: "bg-pri text-on-pri",
  },
  {
    code: "GRADE B",
    range: "50% - 70% Pasar",
    title: "Normal Minus Kosmetik",
    desc: "Unit berfungsi normal seluruhnya, namun tanpa box, ada lecet pemakaian wajar, baterai laptop drop tipis, atau debu heatsink tebal.",
    foot: "Paling Sering Masuk",
    codeClass: "bg-sec text-on-sec",
  },
  {
    code: "GRADE C",
    range: "30% - 50% Pasar",
    title: "Rusak Sebagian / Minor",
    desc: "Masih menyala/POST tapi ada kendala: port USB/HDMI mati, kipas VGA macet, keyboard laptop error, atau display baret dalam.",
    foot: "Bahan Servis Lab Kami",
    codeClass: "bg-surface-variant text-on-surface",
  },
  {
    code: "GRADE D",
    range: "Rp 50rb - 1.5Jt+",
    title: "Rusak Berat / Matot",
    desc: "Mati total, bekas short circuit, terkena cairan, korosi parah, atau artefak parah. Tetap berharga untuk kanibal IC, VRAM, dan mosfet!",
    foot: "Pasti Kami Bayar",
    codeClass: "bg-tertiary text-on-tertiary",
  },
];

const steps = [
  {
    n: "01",
    icon: MessageCircle,
    title: "Cek Estimasi / Foto Unit",
    desc: "Kirimkan foto barang, tipe seri lengkap, dan jelaskan kondisi apa adanya (normal, minus, atau mati total) via form web atau WA.",
    foot: "Respon Cepat < 15 Menit",
  },
  {
    n: "02",
    icon: Truck,
    title: "Drop ke Toko atau Jemput",
    desc: "Bawa hardware langsung ke lab Buana Computer di Bantul. Untuk unit banyak atau borongan kantor, kami sediakan kurir jemput lokasi.",
    foot: "Layanan COD DIY Tersedia",
  },
  {
    n: "03",
    icon: ClipboardCheck,
    title: "Cek Fisik & Diagnosa Lab",
    desc: "Teknisi cek tegangan multimeter, tes POST BIOS, dan benchmark kestabilan secara transparan di hadapan Anda (15-30 menit).",
    foot: "Disaksikan Langsung",
  },
  {
    n: "04",
    icon: Banknote,
    title: "Deal & Cair Tunai Instan",
    desc: "Setelah harga final disepakati, pembayaran langsung dicairkan: cash tunai di tempat atau transfer instan (BCA, Mandiri, BRI, QRIS).",
    foot: "Uang Masuk Detik Itu Juga",
  },
];

const faqs = [
  {
    q: "Apakah benar motherboard yang sudah hangus atau kena petir tetap dibeli?",
    a: "Benar. Motherboard mati total tetap memiliki komponen donor yang sangat berharga: chip audio, MOSFET daya 12V, PWM controller, konektor PCIe, dan soket I/O. Nilai taksiran disesuaikan dengan generasi socket dan keutuhan PCB (tidak patah terbelah dua).",
  },
  {
    q: "Bagaimana keamanan data pribadi pada SSD atau Harddisk yang saya jual?",
    a: "Kami mematuhi protokol privasi ketat. Semua media penyimpanan (baik normal maupun bad sector) langsung diproses Zero Fill / Low Level Format di depan Anda jika menghendaki. Data dijamin tidak bisa di-recovery dengan software komersial manapun.",
  },
  {
    q: "Apakah menerima lelang rongsokan borongan dari kantor, sekolah, atau warnet?",
    a: "Sangat bisa! Kami melayani pembelian 10 hingga 200+ unit PC/laptop/monitor. Tim penaksir datang langsung ke lokasi Anda di Yogyakarta, Magelang, Solo, dan Klaten lengkap dengan invoice resmi serta armada pengangkut.",
  },
  {
    q: "Bagaimana jika saya berdomisili di luar Daerah Istimewa Yogyakarta?",
    a: "Kirimkan paket via ekspedisi (J&T, JNE, SiCepat) ke workshop kami di Bantul setelah estimasi awal via WhatsApp. Unboxing dan tes diagnosa lab kami videokan transparan, lalu dana ditransfer ke rekening bank Anda.",
  },
];

const groupIcons: Record<BuybackCategory, LucideIcon> = {
  mobo: CircuitBoard,
  vga: Zap,
  laptop: Laptop,
  "proc-ram": MemoryStick,
};

/* Kode SKU & foto placeholder per kategori (data sellPrices belum punya field
   foto/SKU — di-derive di sini agar JSON harga tidak berubah). */
const skuPrefix: Record<BuybackCategory, string> = {
  mobo: "MOBO",
  vga: "GPU",
  laptop: "LTP",
  "proc-ram": "CPU",
};

const skuImage: Record<BuybackCategory, string> = {
  mobo: "https://picsum.photos/seed/buana-sku-mobo/640/400",
  vga: "https://picsum.photos/seed/buana-sku-vga/640/400",
  laptop: "https://picsum.photos/seed/buana-sku-laptop/640/400",
  "proc-ram": "https://picsum.photos/seed/buana-sku-cpuram/640/400",
};

function gradeBadgeClass(tone: BuybackItem["gradeTone"]): string {
  if (tone === "pri") return "bg-pri/10 text-pri";
  return "bg-tertiary/10 text-tertiary";
}

/* Lapisan stack foto hero: diam = numpuk rapat (cuma foto depan keliatan).
   Hover = dua foto belakang cuma miring (rotate) dengan poros bawah
   (origin-bottom) — bawah dipaku diam, atas ngipas kanan & kiri. */
const heroLayerClass = [
  {
    z: "z-30",
    rest: "translate-x-0 translate-y-0 scale-100 rotate-0",
    hover: "",
  },
  {
    z: "z-20",
    rest: "translate-x-0 translate-y-0 scale-100 rotate-0",
    hover: "group-hover:-rotate-[15deg]",
  },
  {
    z: "z-10",
    rest: "translate-x-0 translate-y-0 scale-100 rotate-0",
    hover: "group-hover:rotate-[15deg]",
  },
];

function JualHero() {
  // Stack 3 foto hero (numpuk saat diam, fan-out saat hover). Fallback: foto
  // tunggal `hero` bila heroStack belum terisi 3 URL.
  const heroStack =
    jualAssets.heroStack.length >= 3
      ? jualAssets.heroStack.slice(0, 3)
      : [jualAssets.hero, jualAssets.hero, jualAssets.hero];
  return (
    <section className="relative w-full overflow-hidden bg-surface-lowest">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-pri/5 via-transparent to-sec-container/10" />
      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-8 px-4 py-10 sm:py-14 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-8">
          <div className="font-monotech inline-flex items-center gap-2 rounded-full bg-surface-high px-3 py-1 text-[11px] text-pri">
            <span className="h-2 w-2 animate-pulse rounded-full bg-tertiary" />
            <span>Update Harga Pasar: Minggu Ini</span>
            <span className="mx-1 text-outline">•</span>
            <span className="font-medium text-on-surface-variant">
              Bantul &amp; D.I. Yogyakarta
            </span>
          </div>
          <div className="space-y-2">
            <p className="font-monotech text-[13px] uppercase tracking-wider text-sec">
              Katalog Terima &amp; Buyback Komponen
            </p>
            <h1 className="font-heading text-2xl sm:text-4xl lg:text-5xl font-bold leading-[1.15] tracking-tight text-on-surface">
              Jual Hardware Bekas &amp; Rusak Jadi{" "}
              <span className="text-pri underline decoration-sec-container decoration-wavy underline-offset-8">
                Rupiah
              </span>{" "}
              — Buana Computer Bantul
            </h1>
          </div>
          <p className="max-w-2xl text-base leading-relaxed text-on-surface-variant sm:text-lg">
            Buana Computer menerima laptop second, PC rakitan, motherboard mati/rusak, VGA artefak,
            monitor bergaris, prosesor, SSD/HDD bad sector, hingga rongsokan limbah elektronik
            kantor. Taksiran akurat, cek teknis transparan di tempat, dan pembayaran instan.
          </p>
          <div className="font-monotech flex flex-wrap items-center gap-2 pt-1 text-[11px] text-on-surface">
            <div className="flex items-center gap-1.5 rounded bg-surface-container px-3 py-1.5 shadow-sm">
              <BadgeCheck size={16} className="text-pri" />
              <span>Estimasi Transparan</span>
            </div>
            <div className="flex items-center gap-1.5 rounded bg-surface-container px-3 py-1.5 shadow-sm">
              <Recycle size={16} className="text-sec" />
              <span>Terima Normal, Rusak, &amp; Matot</span>
            </div>
            <div className="flex items-center gap-1.5 rounded bg-surface-container px-3 py-1.5 shadow-sm">
              <Banknote size={16} className="text-tertiary" />
              <span>Cair Instan Cash / BCA / QRIS</span>
            </div>
          </div>
        </div>
        <div className="lg:col-span-4">
          <div className="group relative aspect-[3/4] w-full max-w-[260px] sm:max-w-xs mx-auto lg:max-w-none">
            {heroStack.map((src, i) => (
              <img
                key={`${i}-${src}`}
                src={src}
                alt={`Foto hero ${i + 1} — lab & workshop Buana Computer Bantul`}
                loading={i === 0 ? "eager" : "lazy"}
                className={`absolute inset-0 h-full w-full origin-bottom rounded-xl object-cover shadow-lg transition-all duration-500 ease-out ${heroLayerClass[i].z} ${heroLayerClass[i].rest} ${heroLayerClass[i].hover}`}
              />
            ))}
          </div>
        </div>
      </div>
      <div className="relative mx-auto grid max-w-7xl grid-cols-2 gap-2.5 px-4 pb-10 sm:gap-4 sm:pb-14 lg:grid-cols-4">
        <div className="flex items-center gap-2.5 rounded-xl bg-surface-lowest p-3 sm:p-4 shadow-sm">
          <span className="font-heading text-xl sm:text-2xl font-bold tracking-tight text-pri">
            1,840+
          </span>
          <p className="text-xs sm:text-sm leading-tight text-on-surface-variant">
            Komponen Rusak Di-salvage 2024
          </p>
        </div>
        <div className="flex items-center gap-2.5 rounded-xl bg-surface-lowest p-3 sm:p-4 shadow-sm">
          <span className="font-heading text-xl sm:text-2xl font-bold tracking-tight text-on-surface">
            15 Mnt
          </span>
          <p className="text-xs sm:text-sm leading-tight text-on-surface-variant">
            Rata-rata Uji Multi-tester
          </p>
        </div>
        <div className="col-span-2 sm:col-span-1 flex items-center gap-2.5 rounded-xl bg-surface-lowest p-3 sm:p-4 shadow-sm">
          <Store size={20} className="shrink-0 text-sec" />
          <p className="text-xs sm:text-sm leading-tight text-on-surface-variant">
            Mertosan Kulon, Banguntapan, Bantul DIY (COD Jogja)
          </p>
        </div>
        <a
          href="#tabel-harga"
          className="col-span-2 sm:col-span-1 font-heading flex items-center justify-center gap-2 rounded-xl bg-pri px-4 py-3 text-xs sm:text-sm font-semibold text-on-pri shadow-sm transition-all hover:bg-pri-container text-center"
        >
          Jelajahi Price List Lengkap <span aria-hidden>↓</span>
        </a>
      </div>
    </section>
  );
}

function PromoBonus() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 pt-8">
      <div className="flex flex-col items-center gap-6 rounded-2xl border border-pri/20 bg-gradient-to-br from-pri/10 via-surface-lowest to-sec/10 p-5 shadow-md lg:flex-row lg:p-7">
        <div className="w-full shrink-0 overflow-hidden rounded-xl border border-outline-variant/30 shadow-lg lg:w-3/5">
          <img
            src="https://picsum.photos/seed/buana-promo-buyback/900/420"
            alt="Promo tebus hardware bekas Buana Computer"
            loading="lazy"
            className="h-auto w-full object-cover transition-transform duration-300 hover:scale-[1.01]"
          />
        </div>
        <div className="flex w-full flex-col justify-center space-y-3 lg:w-2/5">
          <div className="font-monotech inline-flex items-center gap-1.5 self-start rounded-full bg-tertiary-container px-3 py-0.5 text-[11px] font-bold uppercase tracking-wider text-on-tertiary-container">
            <span className="h-2 w-2 animate-ping rounded-full bg-tertiary" />
            Promo Bulan Ini
          </div>
          <h3 className="font-heading text-2xl font-bold leading-tight text-on-surface lg:text-3xl">
            Bonus Taksir +10% untuk Motherboard &amp; VGA Rusak/Artefak
          </h3>
          <p className="text-sm leading-relaxed text-on-surface-variant">
            Khusus penyerahan via COD Jemput Barang dan Drop langsung ke Lab Buana Computer minggu
            ini. Ekstra nilai kompensasi tunai tanpa potongan tersembunyi!
          </p>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <Link
              to="/jual/form"
              className="font-heading inline-flex items-center gap-1.5 rounded-lg bg-pri px-4 py-2 text-sm font-semibold text-on-pri shadow-sm transition-colors hover:bg-pri-container"
            >
              Klaim Bonus Promo <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function GradeGuide() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:py-14">
      <div className="mb-8 space-y-2">
        <div className="font-monotech flex items-center gap-2 text-[11px] uppercase tracking-widest text-pri">
          <span aria-hidden>⚙</span>
          <span>Standar Penilaian Objektif</span>
        </div>
        <h2 className="font-heading text-2xl font-bold text-on-surface sm:text-3xl lg:text-4xl">
          Pedoman Grade Kondisi Hardware
        </h2>
        <p className="max-w-2xl text-on-surface-variant">
          Kami tidak memukul rata semua barang bekas. Setiap komponen dinilai berbasis kelengkapan
          fungsional, integritas PCB, dan potensi pemanfaatan kanibal.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {grades.map((g) => (
          <div
            key={g.code}
            className="flex flex-col justify-between space-y-4 rounded-xl bg-surface-lowest p-5 shadow-sm transition-all hover:shadow-md"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span
                  className={`font-monotech rounded px-3 py-0.5 text-[11px] font-bold ${g.codeClass}`}
                >
                  {g.code}
                </span>
                <span className="font-monotech text-[11px] font-semibold text-on-surface-variant">
                  {g.range}
                </span>
              </div>
              <h3 className="font-heading font-semibold text-on-surface">{g.title}</h3>
              <p className="text-sm leading-relaxed text-on-surface-variant">{g.desc}</p>
            </div>
            <div className="font-monotech flex items-center gap-2 rounded bg-surface-low p-2 text-[11px] text-on-surface">
              <BadgeCheck size={18} className="shrink-0 text-pri" />
              <span>{g.foot}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function GalleryTerima() {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const pausedRef = useRef(false);
  const items = jualAssets.gallery;

  const step = () => {
    const el = trackRef.current;
    if (!el) return 296;
    const card = el.querySelector<HTMLElement>("[data-gal-card]");
    return (card?.offsetWidth ?? 280) + 16;
  };

  const next = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 24;
    if (atEnd) el.scrollTo({ left: 0, behavior: "smooth" });
    else el.scrollBy({ left: step(), behavior: "smooth" });
  }, []);

  const prev = () => {
    const el = trackRef.current;
    if (!el) return;
    if (el.scrollLeft <= 24) el.scrollTo({ left: el.scrollWidth, behavior: "smooth" });
    else el.scrollBy({ left: -step(), behavior: "smooth" });
  };

  useEffect(() => {
    const id = window.setInterval(() => {
      if (!pausedRef.current && !document.hidden) next();
    }, 3500);
    return () => window.clearInterval(id);
  }, [next]);

  return (
    <section className="mx-auto w-full max-w-7xl px-4 pb-10">
      <div className="space-y-6 rounded-2xl border border-outline-variant/30 bg-surface-lowest p-6 shadow-sm lg:p-10">
        <div className="max-w-2xl space-y-2">
          <div className="font-monotech flex items-center gap-2 text-[11px] uppercase tracking-widest text-pri">
            <span aria-hidden>📦</span>
            <span>Galeri Barang Masuk Lab Buana</span>
          </div>
          <h2 className="font-heading text-2xl font-bold text-on-surface sm:text-3xl lg:text-4xl">
            Contoh Barang yang Pernah Dijual ke Kami
          </h2>
          <p className="text-on-surface-variant">
            Foto nyata kondisi barang yang sudah kami terima &amp; bayar — biar Anda tahu persis
            standar yang kami maksud dan tidak ragu mengajukan.
          </p>
        </div>
        <div
          className="relative"
          onMouseEnter={() => (pausedRef.current = true)}
          onMouseLeave={() => (pausedRef.current = false)}
          onTouchStart={() => (pausedRef.current = true)}
          onTouchEnd={() => window.setTimeout(() => (pausedRef.current = false), 1200)}
        >
          <div
            ref={trackRef}
            className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {items.map((g) => (
              <div
                key={g.title}
                data-gal-card
                className="w-[240px] shrink-0 snap-start sm:w-[280px]"
              >
                <div className="px-0.5 pb-2">
                  <span className="font-monotech inline-block rounded bg-pri/10 px-2 py-0.5 text-[11px] font-semibold text-pri">
                    {g.chip}
                  </span>
                  <h4 className="font-heading mt-1 line-clamp-1 text-sm font-semibold text-on-surface">
                    {g.title}
                  </h4>
                </div>
                <img
                  src={g.img}
                  alt={g.title}
                  loading="lazy"
                  draggable={false}
                  className="aspect-[4/3] w-full rounded-xl border border-surface-container object-cover shadow-sm"
                />
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={prev}
            aria-label="Geser galeri ke kiri"
            className="absolute top-1/2 left-0 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-outline-variant/40 bg-surface-lowest text-on-surface shadow-md transition-colors hover:bg-surface-high"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="Geser galeri ke kanan"
            className="absolute top-1/2 right-0 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-outline-variant/40 bg-surface-lowest text-on-surface shadow-md transition-colors hover:bg-surface-high"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </section>
  );
}

const catalogFilters: { id: BuybackCategory | "all"; label: string }[] = [
  { id: "all", label: "Semua Komponen" },
  { id: "laptop", label: "Laptop Bekas / Mati" },
  { id: "mobo", label: "Motherboard & IC" },
  { id: "vga", label: "VGA Card Bekas/Rusak" },
  { id: "proc-ram", label: "Processor, RAM & SSD" },
];

function BuybackCard({
  item,
  sku,
  onAjukan,
}: {
  item: BuybackItem;
  sku: string;
  onAjukan: (title: string, category: BuybackCategory) => void;
}) {
  return (
    <div className="group flex flex-col justify-between gap-2 rounded-xl bg-surface-lowest p-2.5 shadow-sm transition-all hover:shadow-md">
      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <span
            className={`font-monotech rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase ${gradeBadgeClass(item.gradeTone)}`}
          >
            {item.grade}
          </span>
          <span className="font-monotech text-[9px] text-outline">{sku}</span>
        </div>
        <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-surface-container">
          <img
            src={skuImage[item.category]}
            alt={item.title}
            loading="lazy"
            className="h-full w-full object-cover object-center transition-all duration-300 group-hover:scale-110"
          />
        </div>
        <div>
          <h4 className="font-heading text-[13px] font-semibold leading-snug text-on-surface">
            {item.title}
          </h4>
        </div>
      </div>
      <div className="flex flex-col gap-0.5 rounded-lg bg-surface-low p-2">
        <span className="font-monotech text-[9px] uppercase tracking-wider text-outline">
          Estimasi Penawaran
        </span>
        <span
          className={`font-heading text-sm font-bold ${item.priceTone === "pri" ? "text-pri" : "text-tertiary"}`}
        >
          {item.price}
        </span>
        <button
          onClick={() => onAjukan(item.title, item.category)}
          className="font-heading mt-0.5 inline-flex w-full items-center justify-center gap-1 rounded-lg bg-surface-high px-3 py-1 text-xs font-semibold text-on-surface shadow-sm transition-colors hover:bg-pri hover:text-on-pri"
        >
          Ajukan Jual <span aria-hidden>→</span>
        </button>
      </div>
    </div>
  );
}

function BuybackCatalog({
  onAjukan,
}: {
  onAjukan: (title: string, category: BuybackCategory) => void;
}) {
  const [filter, setFilter] = useState<BuybackCategory | "all">("all");
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const cats = (Object.keys(buybackCategoryMeta) as BuybackCategory[]).filter(
    (c) => filter === "all" || filter === c,
  );
  // Daftar datar + SKU stabil per kategori (MOBO-01, GPU-01, …).
  const flat = cats.flatMap((c) =>
    buybackItems
      .filter((it) => it.category === c && (!q || it.searchText.toLowerCase().includes(q)))
      .map((it, i) => ({ it, sku: `${skuPrefix[c]}-${String(i + 1).padStart(2, "0")}` })),
  );

  return (
    <section id="tabel-harga" className="mx-auto w-full max-w-7xl scroll-mt-24 px-4 py-10">
      <div className="space-y-4 rounded-xl bg-surface-lowest p-4 shadow-sm">
        <div className="flex flex-col items-start justify-between gap-3 md:flex-row md:items-center">
          <div className="relative w-full md:w-96">
            <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari seri: RTX 3060, H61 Matot, Ryzen, ThinkPad..."
              aria-label="Cari hardware"
              className="w-full rounded-lg bg-surface-low py-2 pl-10 pr-4 text-sm text-on-surface shadow-sm outline-none placeholder:text-outline focus:ring-2 focus:ring-pri"
            />
          </div>
          <div className="font-monotech flex items-center gap-2 self-start text-[11px] text-on-surface-variant md:self-auto">
            <Info size={18} className="text-pri" />
            <span>Harga fluktuatif mengikuti kurs dollar &amp; ketersediaan part kanibal</span>
          </div>
        </div>
        <div className="font-monotech flex items-center gap-2 overflow-x-auto pb-1 text-[13px]">
          {catalogFilters.map((f) => {
            const active = filter === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`shrink-0 rounded-full px-4 py-1.5 font-medium transition-all ${
                  active
                    ? "bg-on-surface text-surface"
                    : "bg-surface-container text-on-surface-variant hover:text-on-surface"
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-10 pt-8">
        {flat.length === 0 && (
          <p className="rounded-xl bg-surface-lowest p-8 text-center text-sm text-on-surface-variant shadow-sm">
            Tidak ada hardware yang cocok dengan pencarian. Coba kata kunci lain atau konsultasi
            langsung via WhatsApp.
          </p>
        )}
        {filter === "all" ? (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
            {flat.map(({ it, sku }) => (
              <BuybackCard
                key={`${it.category}-${it.title}`}
                item={it}
                sku={sku}
                onAjukan={onAjukan}
              />
            ))}
          </div>
        ) : (
          cats.map((c) => {
            const Icon = groupIcons[c];
            const meta = buybackCategoryMeta[c];
            const rows = flat.filter(({ it }) => it.category === c);
            if (rows.length === 0) return null;
            return (
              <div key={c} className="space-y-4">
                <div className="flex items-center justify-between pb-1">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded bg-pri/10 text-pri">
                      <Icon size={20} />
                    </div>
                    <div>
                      <h3 className="font-heading text-lg sm:text-xl font-semibold text-on-surface">
                        {meta.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-on-surface-variant">{meta.desc}</p>
                    </div>
                  </div>
                  <span className="font-monotech hidden text-[11px] text-outline sm:inline-block">
                    {meta.count}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
                  {rows.map(({ it, sku }) => (
                    <BuybackCard key={it.title} item={it} sku={sku} onAjukan={onAjukan} />
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}

function StepsSection() {
  return (
    <section className="w-full bg-surface-lowest py-10 sm:py-14">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mx-auto mb-10 max-w-2xl space-y-2 text-center">
          <span className="font-monotech text-[11px] font-semibold uppercase tracking-widest text-pri">
            Prosedur Cepat &amp; Aman
          </span>
          <h2 className="font-heading text-2xl font-bold text-on-surface sm:text-3xl lg:text-4xl">
            Alur Mudah Jual Hardware Anda ke Buana Computer
          </h2>
          <p className="text-on-surface-variant">
            Dari konsultasi santai lewat WhatsApp hingga uang masuk ke rekening Anda dalam hitungan
            menit.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((s) => (
            <div
              key={s.n}
              className="flex flex-col justify-between space-y-4 rounded-xl bg-surface-low p-5 shadow-sm"
            >
              <div className="space-y-3">
                <div className="font-heading flex h-10 w-10 items-center justify-center rounded-full bg-pri font-bold text-on-pri">
                  {s.n}
                </div>
                <h4 className="font-heading font-semibold text-on-surface">{s.title}</h4>
                <p className="text-sm leading-relaxed text-on-surface-variant">{s.desc}</p>
              </div>
              <div className="font-monotech flex items-center gap-1 text-[11px] font-semibold text-pri">
                <s.icon size={16} />
                <span>{s.foot}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link
            to="/jual/form"
            className="font-heading inline-flex items-center gap-2 rounded-xl bg-pri-container px-8 py-3.5 font-bold text-on-pri shadow-lg transition-all hover:bg-pri"
          >
            Mulai Isi Form Pengajuan Jual <span aria-hidden>→</span>
          </Link>
          <p className="font-monotech mt-3 text-[11px] text-outline">
            Estimasi kilat gratis • Respon rata-rata 7 menit
          </p>
        </div>
      </div>
    </section>
  );
}

function JualFaq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:py-14">
      <div className="mb-8 space-y-2 text-center">
        <span className="font-monotech text-[11px] font-semibold uppercase tracking-widest text-pri">
          Tanya Jawab Seputar Jual Beli
        </span>
        <h2 className="font-heading text-2xl font-bold text-on-surface sm:text-3xl lg:text-4xl">
          Frequently Asked Questions
        </h2>
        <p className="text-on-surface-variant">
          Hal-hal yang sering ditanyakan penjual hardware di Buana Computer
        </p>
      </div>
      <div className="mx-auto max-w-4xl space-y-3">
        {faqs.map((f, i) => {
          const isOpen = open === i;
          return (
            <div key={f.q} className="overflow-hidden rounded-xl bg-surface-lowest shadow-sm">
              <button
                onClick={() => setOpen(isOpen ? null : i)}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left font-heading font-semibold text-on-surface transition-colors hover:text-pri"
              >
                <span>{f.q}</span>
                <ChevronDown
                  size={20}
                  className={`shrink-0 text-outline transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                />
              </button>
              {isOpen && (
                <p className="px-5 pb-4 text-sm leading-relaxed text-on-surface-variant">{f.a}</p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function TradeInCta() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 pb-10 sm:pb-14">
      <div className="flex flex-col items-center justify-between gap-6 rounded-2xl bg-gradient-to-r from-pri via-pri-container to-sec p-6 text-on-pri shadow-xl lg:flex-row lg:p-10">
        <div className="max-w-2xl space-y-2">
          <div className="font-monotech inline-flex items-center gap-1.5 rounded-full bg-on-pri/20 px-3 py-0.5 text-[11px] font-semibold uppercase tracking-wider">
            <Recycle size={14} />
            Program Tukar Tambah (Trade-In Upgrade)
          </div>
          <h3 className="font-heading text-2xl font-bold sm:text-3xl">
            Bawa Laptop / PC Lama Rusak Anda, Bawa Pulang Rakitan Baru Bergaransi!
          </h3>
          <p className="text-on-pri/90">
            Hardware lama atau laptop rusak Anda langsung dipotongkan sebagai uang muka (DP) tukar
            tambah PC kantor, PC gaming, maupun laptop normal bergaransi lab Buana Computer.
          </p>
        </div>
        <div className="flex w-full shrink-0 flex-col items-center gap-3 sm:w-auto sm:flex-row lg:flex-col xl:flex-row">
          <Link
            to="/jual/form"
            className="font-heading flex w-full items-center justify-center gap-2 rounded-xl bg-surface-lowest px-6 py-3 text-center font-bold text-pri shadow-md transition-colors hover:bg-surface-high sm:w-auto"
          >
            Konsultasi Trade-In <span aria-hidden>→</span>
          </Link>
          <a
            href={WA_TRADEIN}
            target="_blank"
            rel="noreferrer"
            className="font-heading flex w-full items-center justify-center gap-2 rounded-xl border border-on-pri/30 bg-on-pri/10 px-5 py-3 text-center text-on-pri transition-colors hover:bg-on-pri/20 sm:w-auto"
          >
            <MessageCircle size={18} /> Hubungi Tim Sales
          </a>
        </div>
      </div>
    </section>
  );
}

function JualPage() {
  const navigate = useNavigate();

  const handleAjukan = (title: string, category: BuybackCategory) => {
    navigate({ to: "/jual/form", search: { model: title, category } });
  };

  return (
    <div className="min-h-screen bg-surface">
      <SiteHeader />
      <JualHero />
      <PromoBonus />
      <GradeGuide />
      <GalleryTerima />
      <BuybackCatalog onAjukan={handleAjukan} />
      <StepsSection />
      <JualFaq />
      <TradeInCta />
      <SiteFooter />
    </div>
  );
}
