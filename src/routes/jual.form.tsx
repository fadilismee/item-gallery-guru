import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowLeft,
  BadgeCheck,
  Banknote,
  CircuitBoard,
  Eye,
  Headset,
  History,
  Info,
  Laptop,
  MemoryStick,
  MessageCircle,
  Monitor,
  PcCase,
  PowerOff,
  Recycle,
  Send,
  ShieldCheck,
  Wrench,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import {
  appraisalCategories,
  appraisalConditions,
  appraisalRates,
  type AppraisalCategory,
  type AppraisalCondition,
} from "@/data/sellPrices";

export const Route = createFileRoute("/jual/form")({
  validateSearch: (search: Record<string, unknown>) => ({
    model: typeof search.model === "string" ? search.model : undefined,
    category: typeof search.category === "string" ? search.category : undefined,
  }),
  head: () => ({
    meta: [
      {
        title: "Form Pengajuan Jual & Taksir Hardware Bekas/Rusak — Buana Computer Bantul",
      },
      {
        name: "description",
        content:
          "Formulir pengajuan jual hardware bekas atau rusak: laptop, PC, motherboard, VGA, RAM & SSD. Estimasi kilat gratis, taksiran transparan, dana cair instan. Buana Computer Bantul, Yogyakarta. WA 6285979220599.",
      },
      {
        name: "keywords",
        content:
          "formulir jual laptop bekas, taksir hardware rusak, jual laptop matot, estimasi harga laptop bekas, appraisal buyback bantul, jual motherboard rusak, jual vga artefak, tukar tambah laptop yogyakarta",
      },
      {
        property: "og:title",
        content: "Form Pengajuan Jual & Taksir Hardware — Buana Computer",
      },
      {
        property: "og:description",
        content:
          "Isi detail unit bekas/rusak Anda, dapatkan estimasi taksiran kilat gratis dari teknisi Buana Computer. Gratis, tanpa kewajiban menjual.",
      },
      { property: "og:image", content: "https://buanacomputer.web.id/Buanacomputer-logo.png" },
      { property: "og:url", content: "https://buanacomputer.web.id/jual/form" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://buanacomputer.web.id/jual/form" }],
  }),
  component: JualFormPage,
});

const WA_NUMBER = "6285979220599";

const catIcons: Record<AppraisalCategory, LucideIcon> = {
  laptop: Laptop,
  pc_rakitan: PcCase,
  motherboard: CircuitBoard,
  vga: Zap,
  monitor: Monitor,
  lainnya: MemoryStick,
};

const catSub: Record<AppraisalCategory, string> = {
  laptop: "Normal / Matot / Pecah",
  pc_rakitan: "Gaming, Kantor, Server",
  motherboard: "Intel/AMD LGA & AM4/AM5",
  vga: "GeForce GTX/RTX, Radeon RX",
  monitor: "LED, IPS, Curved, Gaming",
  lainnya: "CPU, RAM DDR4/5, SSD/HDD",
};

const condIcons: Record<AppraisalCondition, LucideIcon> = {
  normal: BadgeCheck,
  minus_ringan: Info,
  rusak_spesifik: Wrench,
  matot: PowerOff,
};

const condDesc: Record<AppraisalCondition, string> = {
  normal: "Semua fitur normal, tidak ada cacat sirkuit, bodi mulus layak pakai harian.",
  minus_ringan:
    "Misal: baterai drop, keyboard beberapa tombol mati, port USB longgar, casing retak tipis.",
  rusak_spesifik: "VGA artefak garis-garis, PC sering blue screen (BSOD), kipas macet & overheat.",
  matot: "Kena petir, konslet tegangan PLN, tumpahan air, atau motherboard terbakar/gosong.",
};

const condBadge: Record<AppraisalCondition, string> = {
  normal: "Nilai Tertinggi",
  minus_ringan: "Sering Diajukan",
  rusak_spesifik: "Taksir Servis",
  matot: "Kanibal Komponen",
};

type Handover = "store_visit" | "pickup_jogja" | "expedition";
const handovers: { id: Handover; title: string; tag: string; desc: string }[] = [
  {
    id: "store_visit",
    title: "Bawa Langsung ke Toko (Rekomendasi Cepat)",
    tag: "Tes Kilat 15 Menit",
    desc: "Mertosan Kulon, Potorono, Banguntapan, Bantul. Pengecekan lab transparan langsung di hadapan Anda, dana cair di menit ke-16.",
  },
  {
    id: "pickup_jogja",
    title: "Layanan Jemput Teknisi (Area DIY)",
    tag: "Gratis Jemput",
    desc: "Khusus wilayah Bantul, Kota Yogyakarta, dan Sleman. Teknisi kami datang ke rumah/kantor dengan alat tes portabel.",
  },
  {
    id: "expedition",
    title: "Kirim via Ekspedisi / Paket (Luar DIY)",
    tag: "J&T, JNE, Paxel",
    desc: "Unit dikirim dengan packing aman berbubble wrap. Video unboxing tanpa cut saat tiba di lab Buana Computer.",
  },
];

type Payout = "bca" | "mandiri" | "bri" | "ewallet" | "cash";
const payouts: { id: Payout; label: string; sub: string }[] = [
  { id: "bca", label: "Bank BCA", sub: "Real-time" },
  { id: "mandiri", label: "Mandiri", sub: "Real-time" },
  { id: "bri", label: "Bank BRI", sub: "Real-time" },
  { id: "ewallet", label: "GoPay/Dana", sub: "Bebas Admin" },
  { id: "cash", label: "Tunai / Cash", sub: "Di Tempat" },
];

const trustPillars = [
  {
    icon: ShieldCheck,
    iconClass: "bg-pri-fixed/50 text-pri",
    title: "Jaminan Keamanan Data (Military Wipe)",
    desc: "Kami memformat HDD/SSD standar sanitasi militer bersertifikasi sebelum komponen difungsikan kembali. Data pribadi Anda 100% musnah tanpa jejak.",
  },
  {
    icon: Recycle,
    iconClass: "bg-sec-fixed/40 text-sec",
    title: "Terima Semua Kondisi (No Rejection)",
    desc: 'Bahkan perangkat yang ditolak toko lain karena "tidak ada harapan" tetap kami hargai untuk cadangan IC, kapasitor, heatsink, dan kanibal sasis.',
  },
  {
    icon: Eye,
    iconClass: "bg-surface-high text-on-surface",
    title: "Transparan & Tanpa Drama",
    desc: "Alat ukur multimeter, tester RAM, dan PSU tester bekerja di hadapan Anda. Tidak ada trik menurunkan harga secara sepihak.",
  },
  {
    icon: Banknote,
    iconClass: "bg-tertiary-fixed/50 text-tertiary",
    title: "Dana Cair Detik Itu Juga",
    desc: "Begitu Anda sepakat dengan nilai appraisal, transfer bank instan atau amplop tunai diserahkan di tempat tanpa tempo.",
  },
];

const recentDeals = [
  { item: "Laptop Asus X441 Matot", who: "Bpk. Dani (Sleman) • 3 jam lalu", price: "Rp 450.000" },
  {
    item: "VGA GTX 1660 Ti Artefak",
    who: "Mas Irfan (Potorono) • 5 jam lalu",
    price: "Rp 750.000",
  },
  {
    item: "Mobo B450 + Ryzen 5 3600",
    who: "Dimas K. (Kotagede) • Hari ini",
    price: "Rp 1.350.000",
  },
];

const completenessOptions = [
  { id: "unit_only", label: "Unit Batangan Saja (Tanpa Aksesoris)" },
  { id: "adaptor", label: "Adaptor / Kabel Power Original" },
  { id: "box", label: "Dus / Box Kemasan Original" },
  { id: "nota", label: "Nota Pembelian / Kartu Garansi" },
];

function mapBuybackToAppraisal(raw: string | undefined): AppraisalCategory {
  switch (raw) {
    case "motherboard":
    case "mobo":
      return "motherboard";
    case "vga":
      return "vga";
    case "laptop":
      return "laptop";
    case "pc_rakitan":
      return "pc_rakitan";
    case "monitor":
      return "monitor";
    case "lainnya":
    case "proc-ram":
      return "lainnya";
    default:
      return "laptop";
  }
}

function StepHeader({
  n,
  total,
  title,
  desc,
}: {
  n: number;
  total: number;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex items-center justify-between border-b border-surface-container pb-3">
      <div className="flex items-center gap-3">
        <span className="font-monotech flex h-7 w-7 items-center justify-center rounded-lg bg-pri-container text-[13px] font-bold text-on-pri">
          {n}
        </span>
        <div>
          <h2 className="font-heading font-semibold text-on-surface">{title}</h2>
          <p className="text-sm text-on-surface-variant">{desc}</p>
        </div>
      </div>
      <span className="font-monotech rounded bg-surface-high px-2 py-1 text-[11px] text-pri">
        Langkah {n}/{total}
      </span>
    </div>
  );
}

function JualFormPage() {
  const search = Route.useSearch();
  const [category, setCategory] = useState<AppraisalCategory>(() =>
    mapBuybackToAppraisal(search.category),
  );
  const [model, setModel] = useState(search.model ?? "");
  const [completeness, setCompleteness] = useState<string[]>(["adaptor", "box"]);
  const [condition, setCondition] = useState<AppraisalCondition>("minus_ringan");
  const [notes, setNotes] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [handover, setHandover] = useState<Handover>("store_visit");
  const [name, setName] = useState("");
  const [wa, setWa] = useState("");
  const [payout, setPayout] = useState<Payout>("bca");
  const [agree, setAgree] = useState(true);
  const [sent, setSent] = useState(false);

  const catLabel = appraisalCategories.find((c) => c.id === category)?.label ?? category;
  const condLabel = appraisalConditions.find((c) => c.id === condition)?.label ?? condition;
  const handoverLabel = handovers.find((h) => h.id === handover)?.title ?? handover;
  const payoutLabel = payouts.find((p) => p.id === payout)?.label ?? payout;
  const rate = appraisalRates[category][condition];

  const waMessage = encodeURIComponent(
    `Halo Buana Computer, saya ingin mengajukan taksir/jual hardware:\n\n` +
      `Nama: ${name || "-"}\n` +
      `No. WA: ${wa || "-"}\n` +
      `Kategori: ${catLabel}\n` +
      `Model/Tipe: ${model || "-"}\n` +
      `Kondisi: ${condLabel}\n` +
      `Kelengkapan: ${completeness.length > 0 ? completeness.join(", ") : "-"}\n` +
      `Foto: ${photos.length > 0 ? `${photos.length} foto (menyusul via chat)` : "menyusul via chat"}\n` +
      `Penyerahan: ${handoverLabel}\n` +
      `Pencairan: ${payoutLabel}\n` +
      `Catatan: ${notes || "-"}\n\n` +
      `Mohon estimasi penawaran resmi dari teknisi. Terima kasih!`,
  );
  const waHref = `https://wa.me/${WA_NUMBER}?text=${waMessage}`;

  return (
    <div className="min-h-screen bg-surface">
      <SiteHeader />

      <section className="mx-auto w-full max-w-6xl px-4 pb-2 pt-8">
        <nav className="font-monotech flex items-center gap-2 text-[13px] text-on-surface-variant">
          <Link
            to="/jual"
            className="inline-flex items-center gap-1 transition-colors hover:text-pri"
          >
            <ArrowLeft size={14} /> Price List Jual
          </Link>
          <span className="text-outline">›</span>
          <span className="text-on-surface">Form Pengajuan</span>
        </nav>
        <div className="mt-4 space-y-2">
          <div className="font-monotech flex flex-wrap items-center gap-2 text-[11px] text-pri">
            <span className="rounded bg-pri-fixed px-2 py-0.5 font-semibold text-on-pri-fixed">
              FORM RESMI APPRAISAL
            </span>
            <span className="text-outline">•</span>
            <span className="font-medium text-on-surface-variant">
              ESTIMASI KILAT • GRATIS PENGECEKAN
            </span>
          </div>
          <h1 className="font-heading text-2xl font-bold leading-tight tracking-tight text-on-surface sm:text-4xl">
            Formulir Pengajuan Jual &amp; Taksir Hardware
          </h1>
          <p className="max-w-2xl leading-relaxed text-on-surface-variant">
            Ubah tumpukan laptop rusak, motherboard bekas, VGA artefak, atau PC lama Anda menjadi
            dana tunai segar. Penilaian jujur berbasis nilai komponen kanibal dan pasar aktual —
            100% gratis, tanpa kewajiban menjual.
          </p>
        </div>
      </section>

      <section className="w-full bg-surface py-8 sm:py-10">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            <div className="space-y-4 lg:col-span-5">
              <div className="space-y-2">
                <span className="font-monotech text-[11px] font-semibold uppercase tracking-wider text-pri">
                  Simulasi Taksiran Live
                </span>
                <h2 className="font-heading text-2xl font-semibold text-on-surface sm:text-3xl">
                  Pantau Estimasi Harga Sambil Mengisi
                </h2>
                <p className="text-sm leading-relaxed text-on-surface-variant">
                  Setiap pilihan kategori &amp; kondisi langsung menggeser rentang taksiran awal di
                  bawah ini.
                </p>
              </div>

              <div className="rounded-xl bg-surface-lowest p-4 shadow-md">
                <div className="font-monotech flex items-center justify-between border-b border-surface-container pb-2 text-[11px]">
                  <span className="font-semibold uppercase tracking-wider text-pri">
                    Simulasi Taksiran Awal
                  </span>
                  <span className="inline-flex items-center gap-1 font-semibold text-sec">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-sec-container" />
                    Live Rate
                  </span>
                </div>
                <span className="font-monotech mt-3 block text-[11px] text-on-surface-variant">
                  Rentang Estimasi Harga Terima:
                </span>
                <div className="font-heading mt-1 text-xl font-bold text-pri">{rate}</div>
                <p className="font-monotech mt-1 text-[11px] leading-snug text-outline">
                  *Estimasi awal untuk {catLabel} kondisi {condLabel.toLowerCase()}. Harga final
                  disepakati setelah cek lab singkat.
                </p>
                <div className="font-monotech mt-3 space-y-1.5 rounded-lg bg-surface-low p-3 text-[11px]">
                  <div className="flex justify-between text-on-surface-variant">
                    <span>Perangkat Terpilih:</span>
                    <span className="font-semibold text-on-surface">{catLabel}</span>
                  </div>
                  <div className="flex justify-between text-on-surface-variant">
                    <span>Status Kondisi:</span>
                    <span className="font-semibold text-pri">{condLabel}</span>
                  </div>
                  <div className="flex justify-between text-on-surface-variant">
                    <span>Metode Ambil:</span>
                    <span className="font-semibold text-on-surface">{handoverLabel}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 pt-3">
                  <svg viewBox="0 0 36 36" className="h-10 w-10 shrink-0 -rotate-90">
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      className="text-surface-container"
                    />
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeDasharray="92, 100"
                      strokeLinecap="round"
                      strokeWidth="3"
                      className="text-pri-container"
                    />
                  </svg>
                  <div>
                    <span className="font-monotech block text-[11px] font-semibold text-on-surface">
                      Tingkat Penawaran Disetujui: 92%
                    </span>
                    <span className="text-[12px] text-on-surface-variant">
                      9 dari 10 nasabah menyetujui taksiran pertama kami.
                    </span>
                  </div>
                </div>
              </div>

              {/* Extra help and trust cards — in sidebar on desktop, moved below form on mobile */}
              <div className="hidden space-y-4 lg:block">
                <div className="space-y-3 rounded-xl bg-surface-high p-5">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-pri text-on-pri">
                      <Headset size={20} />
                    </div>
                    <div>
                      <h3 className="font-heading text-base font-bold leading-tight text-on-surface">
                        Butuh Tanya Cepat Dulu?
                      </h3>
                      <p className="mt-0.5 text-sm text-on-surface-variant">
                        Langsung hubungi meja teknisi appraisal kami via WhatsApp resmi.
                      </p>
                    </div>
                  </div>
                  <div className="font-monotech flex items-center justify-between rounded-lg bg-surface-lowest p-2 px-3 text-[13px] text-on-surface">
                    <span className="text-outline">Hotline:</span>
                    <span className="font-bold tracking-wide text-pri">{WA_NUMBER}</span>
                  </div>
                  <a
                    href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent("Halo Buana Computer, saya mau konsultasi jual hardware bekas")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="font-heading flex w-full items-center justify-center gap-2 rounded-lg bg-surface-lowest py-2 font-semibold text-pri shadow-sm transition-colors hover:bg-surface"
                  >
                    <MessageCircle size={18} /> Chat Teknisi di WhatsApp
                  </a>
                </div>

                <div className="space-y-4 rounded-xl bg-surface-lowest p-5 shadow-sm">
                  <h3 className="font-heading font-semibold text-on-surface">
                    Kenapa Jual ke Buana Computer?
                  </h3>
                  <div className="space-y-4">
                    {trustPillars.map((t) => (
                      <div key={t.title} className="flex items-start gap-3">
                        <div
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${t.iconClass}`}
                        >
                          <t.icon size={18} />
                        </div>
                        <div>
                          <h4 className="font-heading text-sm font-semibold text-on-surface">
                            {t.title}
                          </h4>
                          <p className="mt-0.5 text-[13px] leading-snug text-on-surface-variant">
                            {t.desc}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 rounded-xl bg-surface-lowest p-5 shadow-sm">
                  <div className="font-monotech flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-sec">
                    <History size={16} />
                    <span>Aktivitas Jual Terkini</span>
                  </div>
                  <div className="divide-y divide-surface-container pt-1">
                    {recentDeals.map((d) => (
                      <div
                        key={d.item}
                        className="flex items-center justify-between pt-2 text-[12px]"
                      >
                        <div>
                          <p className="font-heading text-[13px] font-medium text-on-surface">
                            {d.item}
                          </p>
                          <span className="font-monotech text-outline">{d.who}</span>
                        </div>
                        <span className="font-monotech font-semibold text-pri">{d.price}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <form
              className="flex flex-col gap-6 lg:col-span-7"
              onSubmit={(e) => {
                e.preventDefault();
                setSent(true);
                window.open(waHref, "_blank", "noopener,noreferrer");
              }}
            >
              <div className="space-y-4 rounded-xl bg-surface-lowest p-6 shadow-sm">
                <StepHeader
                  n={1}
                  total={5}
                  title="Kategori & Detail Perangkat"
                  desc="Pilih jenis perangkat keras yang ingin Anda jual"
                />
                <div>
                  <span className="font-heading mb-2 block text-sm font-semibold text-on-surface">
                    Kategori Hardware *
                  </span>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {appraisalCategories.map((c) => {
                      const Icon = catIcons[c.id];
                      const active = category === c.id;
                      return (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => setCategory(c.id)}
                          className={`relative flex flex-col rounded-lg p-3 text-left transition-all ${
                            active
                              ? "bg-surface-high shadow-sm ring-1 ring-pri/40"
                              : "bg-surface hover:bg-surface-container"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <Icon size={24} className={active ? "text-pri" : "text-outline"} />
                            <span
                              className={`flex h-4 w-4 items-center justify-center rounded-full ${active ? "bg-pri text-on-pri" : "hidden bg-surface-highest"}`}
                            >
                              <span className="text-[12px]">✓</span>
                            </span>
                          </div>
                          <span className="font-heading mt-2 text-[15px] font-semibold text-on-surface">
                            {c.label}
                          </span>
                          <span className="font-monotech text-[11px] text-on-surface-variant">
                            {catSub[c.id]}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="deviceModel"
                    className="font-heading block text-sm font-semibold text-on-surface"
                  >
                    Merek &amp; Tipe Spesifik *
                  </label>
                  <input
                    id="deviceModel"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="Contoh: ASUS ROG Zephyrus G14, VGA Palit RTX 3060 12GB"
                    required
                    className="w-full rounded-lg bg-surface-low px-4 py-2.5 text-on-surface outline-none transition-all placeholder:text-outline focus:bg-surface-lowest focus:ring-2 focus:ring-pri"
                  />
                  <p className="font-monotech text-[11px] text-outline">
                    Tuliskan selengkap mungkin termasuk varian RAM/Storage jika laptop atau PC.
                  </p>
                </div>
                <div className="space-y-2">
                  <span className="font-heading block text-sm font-semibold text-on-surface">
                    Kelengkapan Tambahan (Meningkatkan Nilai Taksir)
                  </span>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {completenessOptions.map((o) => (
                      <label
                        key={o.id}
                        className="flex cursor-pointer items-center gap-2 rounded-lg bg-surface px-3 py-2 transition-colors hover:bg-surface-container"
                      >
                        <input
                          type="checkbox"
                          checked={completeness.includes(o.id)}
                          onChange={() =>
                            setCompleteness((prev) =>
                              prev.includes(o.id)
                                ? prev.filter((x) => x !== o.id)
                                : [...prev, o.id],
                            )
                          }
                          className="h-4 w-4 rounded accent-[#0050cb]"
                        />
                        <span className="text-sm text-on-surface">{o.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4 rounded-xl bg-surface-lowest p-6 shadow-sm">
                <StepHeader
                  n={2}
                  total={5}
                  title="Kondisi Fisik & Fungsional"
                  desc="Unit mati total pun memiliki nilai kanibal riil"
                />
                <div className="space-y-2">
                  {appraisalConditions.map((c) => {
                    const Icon = condIcons[c.id];
                    const active = condition === c.id;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setCondition(c.id)}
                        className={`flex w-full items-start gap-3 rounded-lg p-3 text-left transition-all ${
                          active
                            ? "bg-surface-high ring-1 ring-pri/40"
                            : "bg-surface hover:bg-surface-container"
                        }`}
                      >
                        <span
                          className={`mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${active ? "bg-pri" : "bg-surface-highest"}`}
                        >
                          <span
                            className={`h-2 w-2 rounded-full ${active ? "bg-on-pri" : "hidden"}`}
                          />
                        </span>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Icon size={18} className={active ? "text-pri" : "text-outline"} />
                            <span className="font-heading text-[15px] font-semibold text-on-surface">
                              {c.label}
                            </span>
                          </div>
                          <p className="mt-0.5 text-sm text-on-surface-variant">{condDesc[c.id]}</p>
                        </div>
                        <span className="font-monotech shrink-0 rounded bg-surface-high px-2 py-0.5 text-[11px] text-on-surface-variant">
                          {condBadge[c.id]}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="damageNotes"
                    className="font-heading block text-sm font-semibold text-on-surface"
                  >
                    Ceritakan Riwayat &amp; Kronologi Kerusakan
                  </label>
                  <textarea
                    id="damageNotes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    placeholder="Contoh: Terakhir dipakai mati saat rendering tiba-tiba..."
                    className="w-full rounded-lg bg-surface-low p-3 text-sm text-on-surface outline-none transition-all placeholder:text-outline focus:bg-surface-lowest focus:ring-2 focus:ring-pri"
                  />
                  <div className="font-monotech flex items-center gap-2 text-[11px] text-sec">
                    <ShieldCheck size={16} />
                    <span>
                      Unit yang belum pernah diservis acak-acakan (perawan) nilainya hingga 30%
                      lebih tinggi.
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4 rounded-xl bg-surface-lowest p-6 shadow-sm">
                <StepHeader
                  n={3}
                  total={5}
                  title="Foto Fisik & Stiker Identitas"
                  desc="Bantu teknisi memverifikasi chip, seri, dan kondisi fisik luar"
                />
                <label
                  htmlFor="photoUpload"
                  className="flex cursor-pointer flex-col items-center justify-center rounded-xl bg-surface-low p-8 text-center transition-all hover:bg-surface-container"
                >
                  <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-pri-fixed/50 text-pri">
                    <span className="text-2xl">📷</span>
                  </div>
                  <p className="font-heading text-base text-on-surface">
                    {photos.length > 0 ? `${photos.length} foto dipilih` : "Klik untuk Pilih Foto,"}{" "}
                    <span className="font-semibold text-pri">
                      {photos.length > 0 ? "tambah lagi" : "atau seret ke sini"}
                    </span>
                  </p>
                  <p className="font-monotech mt-1 max-w-md text-[11px] text-on-surface-variant">
                    Disarankan: tampak depan, port samping, dan stiker model di balik casing (JPG,
                    PNG, WEBP maks 10MB)
                  </p>
                  <input
                    id="photoUpload"
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => setPhotos(Array.from(e.target.files ?? []).map((f) => f.name))}
                  />
                </label>
                {photos.length > 0 && (
                  <ul className="font-monotech space-y-1 rounded-lg bg-surface p-3 text-[11px] text-on-surface-variant">
                    {photos.map((p) => (
                      <li key={p} className="flex items-center gap-2">
                        <span className="text-sec">✓</span> {p}
                      </li>
                    ))}
                  </ul>
                )}
                <p className="font-monotech text-[11px] text-outline">
                  Foto asli dikirim via chat WhatsApp setelah klik Kirim — cukup pilih di sini
                  sebagai pengingat.
                </p>
              </div>

              <div className="space-y-4 rounded-xl bg-surface-lowest p-6 shadow-sm">
                <StepHeader
                  n={4}
                  total={5}
                  title="Metode Penyerahan Unit"
                  desc="Pilih jalur yang paling praktis & nyaman bagi Anda"
                />
                <div className="space-y-2">
                  {handovers.map((h) => (
                    <label
                      key={h.id}
                      className="flex cursor-pointer items-start gap-3 rounded-lg bg-surface p-3 transition-all hover:bg-surface-container"
                    >
                      <input
                        type="radio"
                        name="handover"
                        checked={handover === h.id}
                        onChange={() => setHandover(h.id)}
                        className="mt-1 accent-[#0050cb]"
                      />
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-1">
                          <span className="font-heading text-[15px] font-semibold text-on-surface">
                            {h.title}
                          </span>
                          <span className="font-monotech text-[11px] font-semibold text-sec">
                            {h.tag}
                          </span>
                        </div>
                        <p className="mt-0.5 text-sm text-on-surface-variant">{h.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-4 rounded-xl bg-surface-lowest p-6 shadow-sm">
                <StepHeader
                  n={5}
                  total={5}
                  title="Data Kontak & Preferensi Pencairan"
                  desc="Hasil taksiran appraisal instan dikirim ke WhatsApp Anda"
                />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label
                      htmlFor="ownerName"
                      className="font-heading block text-sm font-semibold text-on-surface"
                    >
                      Nama Lengkap *
                    </label>
                    <input
                      id="ownerName"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Misal: Budi Pratama"
                      required
                      className="w-full rounded-lg bg-surface-low px-4 py-2.5 text-on-surface outline-none transition-all placeholder:text-outline focus:bg-surface-lowest focus:ring-2 focus:ring-pri"
                    />
                  </div>
                  <div className="space-y-2">
                    <label
                      htmlFor="waNumber"
                      className="font-heading block text-sm font-semibold text-on-surface"
                    >
                      Nomor WhatsApp Aktif *
                    </label>
                    <div className="relative">
                      <span className="font-monotech absolute left-4 top-1/2 -translate-y-1/2 text-[13px] text-outline">
                        +62
                      </span>
                      <input
                        id="waNumber"
                        value={wa}
                        onChange={(e) => setWa(e.target.value.replace(/[^0-9]/g, ""))}
                        placeholder="81234567890"
                        required
                        inputMode="tel"
                        className="w-full rounded-lg bg-surface-low py-2.5 pl-14 pr-4 text-on-surface outline-none transition-all placeholder:text-outline focus:bg-surface-lowest focus:ring-2 focus:ring-pri"
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <span className="font-heading block text-sm font-semibold text-on-surface">
                    Metode Pencairan Dana Pilihan
                  </span>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                    {payouts.map((p) => (
                      <label
                        key={p.id}
                        className={`flex cursor-pointer flex-col items-center justify-center rounded-lg bg-surface p-2 text-center transition-all hover:bg-surface-container ${p.id === "cash" ? "col-span-2 sm:col-span-1" : ""} ${payout === p.id ? "ring-1 ring-pri/40" : ""}`}
                      >
                        <input
                          type="radio"
                          name="payout"
                          checked={payout === p.id}
                          onChange={() => setPayout(p.id)}
                          className="sr-only"
                        />
                        <span
                          className={`font-monotech text-[11px] font-bold ${p.id === "cash" ? "text-sec" : payout === p.id ? "text-pri" : "text-on-surface"}`}
                        >
                          {p.label}
                        </span>
                        <span className="font-monotech text-[10px] text-outline">{p.sub}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <label className="flex cursor-pointer items-start gap-2 pt-1">
                  <input
                    type="checkbox"
                    checked={agree}
                    onChange={(e) => setAgree(e.target.checked)}
                    required
                    className="mt-1 h-4 w-4 rounded accent-[#0050cb]"
                  />
                  <span className="text-sm text-on-surface-variant">
                    Saya menyatakan unit ini milik pribadi yang sah (bukan barang curian/sengketa)
                    dan bersedia menyertakan foto identitas saat pencairan dana sesuai SOP Buana
                    Computer.
                  </span>
                </label>
              </div>

              <div className="space-y-2">
                <button
                  type="submit"
                  className="font-heading flex w-full items-center justify-center gap-2 rounded-xl bg-pri-container px-4 py-3.5 sm:px-6 sm:py-4 text-sm sm:text-base font-bold text-on-pri shadow-lg transition-all hover:bg-pri"
                >
                  <Send size={20} />
                  <span>Kirim Pengajuan &amp; Taksiran via WhatsApp</span>
                </button>
                <div className="font-monotech flex items-center justify-center gap-2 text-center text-[11px] text-outline">
                  <span className="flex items-center gap-1">
                    <ShieldCheck size={16} className="text-sec" />
                    100% Gratis &amp; Tanpa Kewajiban Menjual
                  </span>
                  <span>•</span>
                  <span>Respon ~7 Menit</span>
                </div>
                {sent && (
                  <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">
                    <p className="font-semibold">Terkirim ke WhatsApp!</p>
                    <p className="mt-1">
                      Chat WA sudah terbuka. Silakan kirim foto barang di sana untuk estimasi harga
                      dari Buana Computer.
                    </p>
                    <a
                      href={waHref}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 inline-flex rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
                    >
                      Buka Chat WA Lagi
                    </a>
                  </div>
                )}
              </div>

              {/* Extra help and trust cards for mobile — below the form */}
              <div className="space-y-4 pt-4 lg:hidden">
                <div className="space-y-3 rounded-xl bg-surface-high p-5">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-pri text-on-pri">
                      <Headset size={20} />
                    </div>
                    <div>
                      <h3 className="font-heading text-base font-bold leading-tight text-on-surface">
                        Butuh Tanya Cepat Dulu?
                      </h3>
                      <p className="mt-0.5 text-sm text-on-surface-variant">
                        Langsung hubungi meja teknisi appraisal kami via WhatsApp resmi.
                      </p>
                    </div>
                  </div>
                  <div className="font-monotech flex items-center justify-between rounded-lg bg-surface-lowest p-2 px-3 text-[13px] text-on-surface">
                    <span className="text-outline">Hotline:</span>
                    <span className="font-bold tracking-wide text-pri">{WA_NUMBER}</span>
                  </div>
                  <a
                    href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent("Halo Buana Computer, saya mau konsultasi jual hardware bekas")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="font-heading flex w-full items-center justify-center gap-2 rounded-lg bg-surface-lowest py-2 font-semibold text-pri shadow-sm transition-colors hover:bg-surface"
                  >
                    <MessageCircle size={18} /> Chat Teknisi di WhatsApp
                  </a>
                </div>

                <div className="space-y-4 rounded-xl bg-surface-lowest p-5 shadow-sm">
                  <h3 className="font-heading font-semibold text-on-surface">
                    Kenapa Jual ke Buana Computer?
                  </h3>
                  <div className="space-y-4">
                    {trustPillars.map((t) => (
                      <div key={t.title} className="flex items-start gap-3">
                        <div
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${t.iconClass}`}
                        >
                          <t.icon size={18} />
                        </div>
                        <div>
                          <h4 className="font-heading text-sm font-semibold text-on-surface">
                            {t.title}
                          </h4>
                          <p className="mt-0.5 text-[13px] leading-snug text-on-surface-variant">
                            {t.desc}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
