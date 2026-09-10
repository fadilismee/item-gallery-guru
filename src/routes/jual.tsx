import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ReviewReels } from "@/components/ReviewReels";
import { PurePoster } from "@/components/PurePoster";
import { HeroCarousel } from "@/components/HeroCarousel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatPrice } from "@/data/products";
import { sellPrices } from "@/data/sellPrices";

const sellCategoryImages: Record<string, string> = {
  "Laptop Rusak": "https://picsum.photos/seed/sell-laptop/200/200",
  "PC Rakitan Rusak": "https://picsum.photos/seed/sell-pc/200/200",
  "HDD/SSD Rusak": "https://picsum.photos/seed/sell-hdd/200/200",
  "HP Rusak": "https://picsum.photos/seed/sell-hp/200/200",
  Mainboard: "https://picsum.photos/seed/sell-mainboard/200/200",
  CPU: "https://picsum.photos/seed/sell-cpu/200/200",
  GPU: "https://picsum.photos/seed/sell-gpu/200/200",
  Lainnya: "https://picsum.photos/seed/sell-lainnya/200/200",
};

export const Route = createFileRoute("/jual")({
  head: () => ({
    meta: [
      { title: "Jual Barang Rusak - Buana Computer" },
      {
        name: "description",
        content:
          "Jual laptop, PC, HDD/SSD, HP, mainboard, CPU, GPU rusak ke Buana Computer. Estimasi via WA 6285979220599. Bantul Yogyakarta.",
      },
      { property: "og:title", content: "Jual Barang Rusak - Buana Computer" },
      {
        property: "og:description",
        content:
          "Terima barang rusak: laptop, PC, HDD, HP, mainboard, CPU, GPU. Chat WA untuk estimasi cepat.",
      },
    ],
  }),
  component: JualPage,
});

const sellCategories = [
  "Laptop Rusak",
  "PC Rakitan Rusak",
  "HDD/SSD Rusak",
  "HP Rusak",
  "Mainboard",
  "CPU",
  "GPU",
  "Lainnya",
] as const;

function JualPage() {
  const [category, setCategory] = useState<(typeof sellCategories)[number]>("Laptop Rusak");
  const [activePrice, setActivePrice] = useState(sellPrices[0]!);
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [condition, setCondition] = useState("Mati Total");
  const [damage, setDamage] = useState("");
  const [expectedPrice, setExpectedPrice] = useState("");
  const [name, setName] = useState("");
  const [wa, setWa] = useState("");
  const [address, setAddress] = useState("");
  const [sent, setSent] = useState(false);

  const waMessage = encodeURIComponent(
    `Halo Buana Computer, saya mau JUAL barang rusak:\n` +
      `Kategori: ${category}\n` +
      `Brand: ${brand || "-"}\n` +
      `Model/Tipe: ${model || "-"}\n` +
      `Kondisi: ${condition}\n` +
      `Kerusakan: ${damage || "-"}\n` +
      `Harga harapan: ${expectedPrice ? `Rp ${expectedPrice}` : "-"}\n` +
      `Nama: ${name || "-"}\n` +
      `WA: ${wa || "-"}\n` +
      `Alamat: ${address || "-"}\n` +
      `Foto akan saya kirim via WA ini. Mohon estimasi, terima kasih!`,
  );
  const waHref = `https://wa.me/6285979220599?text=${waMessage}`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    window.open(waHref, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <HeroCarousel />

      <section className="mx-auto max-w-7xl px-4 pb-8">
        <h2 className="text-lg font-bold text-foreground">Perkiraan Harga Satuan</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Pilih kategori — detail besar di kanan, klik kiri untuk ganti. Harga final via WA.
        </p>
        <div className="mt-6 grid gap-6 lg:grid-cols-[320px_1fr] lg:items-stretch">
          {/* Kiri: 8 item kecil — tinggi samain kanan */}
          <div className="order-2 flex gap-2 overflow-x-auto pb-2 lg:order-1 lg:flex-col lg:overflow-visible">
            {sellPrices.map((p) => {
              const active = activePrice.category === p.category;
              return (
                <button
                  key={p.category}
                  onClick={() => setActivePrice(p)}
                  className={`flex shrink-0 items-center gap-3 rounded-xl border px-3 py-3 text-left transition-colors lg:shrink ${
                    active
                      ? "border-primary bg-accent"
                      : "border-border bg-card hover:border-primary/30"
                  }`}
                >
                  <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-muted">
                    <img
                      src={
                        sellCategoryImages[p.category] ??
                        `https://picsum.photos/seed/sell-${p.category}/200/200`
                      }
                      alt={p.category}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-foreground">{p.category}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {formatPrice(p.range[0])} – {formatPrice(p.range[1])} {p.unit}
                    </p>
                  </div>
                  {active && <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />}
                </button>
              );
            })}
          </div>

          {/* Kanan: 1 besar — text di atas img dengan gradient hitam, phone 280 coba */}
          <div className="order-1 flex h-full flex-col lg:order-2">
            <div className="relative flex h-full min-h-[280px] flex-col justify-end overflow-hidden rounded-2xl border sm:min-h-[340px] lg:min-h-[460px]">
              <img
                src={
                  sellCategoryImages[activePrice.category] ??
                  `https://picsum.photos/seed/sell-${activePrice.category}/800/600`
                }
                alt={activePrice.category}
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
              <div className="relative p-6 sm:p-8">
                <p className="text-xs font-semibold uppercase tracking-widest text-white/70">
                  {activePrice.category}
                </p>
                <h3 className="mt-2 text-2xl font-bold text-white sm:text-3xl">
                  {formatPrice(activePrice.range[0])} – {formatPrice(activePrice.range[1])}
                </h3>
                <p className="mt-1 text-sm text-white/80">
                  {activePrice.unit} • {activePrice.example}
                </p>
                <p className="mt-3 max-w-lg text-sm leading-relaxed text-white/70">
                  Estimasi untuk {activePrice.category.toLowerCase()} — harga final tergantung
                  kelengkapan, cek foto/video via WA.
                </p>
                <Button
                  variant="secondary"
                  className="mt-5"
                  onClick={() => {
                    const cat = activePrice.category as (typeof sellCategories)[number];
                    if ((sellCategories as readonly string[]).includes(cat)) setCategory(cat);
                    document.getElementById("form-jual")?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  Pilih {activePrice.category} → Isi Form
                </Button>
              </div>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              * Harga perkiraan saja — final setelah cek foto/video via WA 6285979220599.
            </p>
          </div>
        </div>
      </section>

      <section id="form-jual" className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <form onSubmit={handleSubmit} className="rounded-2xl border bg-card p-6 shadow-sm">
            <h2 className="text-lg font-bold text-foreground">Form Jual Barang Rusak</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Isi data sejelas mungkin — foto cukup kirim via WA setelah klik Kirim.
            </p>

            <div className="mt-6 grid gap-5">
              <div className="grid gap-2">
                <Label>Kategori Barang *</Label>
                <Select value={category} onValueChange={(v) => setCategory(v as typeof category)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sellCategories.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="brand">Brand / Merk</Label>
                  <Input
                    id="brand"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="Misal: Asus, Seagate, Samsung"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="model">Model / Tipe</Label>
                  <Input
                    id="model"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="Misal: ROG GL503, ST1000DM010"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label>Kondisi *</Label>
                <div className="flex flex-wrap gap-2">
                  {["Mati Total", "Rusak Sebagian", "Masih Hidup Tapi Error"].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCondition(c)}
                      className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                        condition === c
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-background hover:border-primary/40"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="damage">Deskripsi Kerusakan *</Label>
                <Textarea
                  id="damage"
                  value={damage}
                  onChange={(e) => setDamage(e.target.value)}
                  placeholder="Jelaskan: tidak nyala, HDD bunyi, layar pecah, no display, dll."
                  rows={4}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="expectedPrice">Harga Harapan (opsional)</Label>
                <Input
                  id="expectedPrice"
                  value={expectedPrice}
                  onChange={(e) => setExpectedPrice(e.target.value.replace(/[^0-9]/g, ""))}
                  placeholder="Misal: 500000"
                  inputMode="numeric"
                />
                <p className="text-xs text-muted-foreground">
                  Kosongkan jika ingin estimasi dari kami via WA.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="name">Nama *</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nama kamu"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="wa">No. WA *</Label>
                  <Input
                    id="wa"
                    value={wa}
                    onChange={(e) => setWa(e.target.value.replace(/[^0-9+]/g, ""))}
                    placeholder="6285xxxxxxx"
                    required
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="address">Alamat</Label>
                <Textarea
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Kecamatan / patokan biar kurir mudah jemput jika deal"
                  rows={2}
                />
              </div>

              <Button type="submit" size="lg" className="mt-2 w-full">
                Kirim via WhatsApp
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                Foto barang silakan kirim langsung di chat WA setelah klik tombol di atas.
              </p>

              {sent && (
                <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">
                  <p className="font-semibold">Terkirim ke WhatsApp!</p>
                  <p className="mt-1">
                    Chat WA sudah terbuka. Silakan kirim foto barang rusak di sana untuk dapat
                    estimasi harga dari Buana Computer.
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
          </form>

          <div className="space-y-6">
            <div className="rounded-2xl border bg-muted p-6">
              <h3 className="text-base font-bold text-foreground">Kategori Diterima</h3>
              <ul className="mt-3 grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                {sellCategories.map((c) => (
                  <li key={c} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    {c}
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-xs text-muted-foreground">
                Kondisi apapun: mati total, no display, HDD bad sector, HP bootloop, mainboard
                korslet, CPU/GPU artefak — semua bisa ditawar.
              </p>
            </div>

            <div className="rounded-2xl border bg-card p-6">
              <h3 className="text-base font-bold text-foreground">Alur Jual</h3>
              <ol className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li>1. Isi form & klik Kirim via WhatsApp</li>
                <li>2. Kirim foto/video barang di chat WA</li>
                <li>3. Kami kasih estimasi harga dalam menit</li>
                <li>4. Deal → antar ke toko atau jemput (Bantul area)</li>
              </ol>
            </div>

            <div className="rounded-2xl border border-dashed bg-card p-6 text-sm">
              <p className="font-semibold text-foreground">Butuh cepat?</p>
              <p className="mt-1 text-muted-foreground">Langsung chat tanpa form juga bisa:</p>
              <a
                href="https://wa.me/6285979220599?text=Halo%20Buana%20Computer%2C%20mau%20jual%20barang%20rusak"
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground hover:bg-primary/90"
              >
                Chat WA 6285979220599
              </a>
            </div>
          </div>
        </div>
      </section>

      <PurePoster />

      <ReviewReels />

      <SiteFooter />
    </div>
  );
}
