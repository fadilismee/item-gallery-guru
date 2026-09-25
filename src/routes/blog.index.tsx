import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Reveal } from "@/components/Reveal";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { blogArticles, blogCategories, type BlogArticle, type TagTone } from "@/data/blog";

export const Route = createFileRoute("/blog/")({
  head: () => ({
    meta: [
      { title: "Buana Journal — Panduan Rakit PC, Review Hardware & Tips Perawatan Komputer" },
      {
        name: "description",
        content:
          "Buana Journal: panduan rakit PC, review hardware hasil uji toko, dan tips perawatan laptop & PC dari tim Buana Computer Store Bantul, Yogyakarta.",
      },
      {
        name: "keywords",
        content:
          "panduan rakit pc, review hardware, tips perawatan laptop, blog komputer indonesia, benchmark komputer, perawatan laptop, teardown laptop",
      },
      { property: "og:title", content: "Buana Journal — Panduan & Review Hardware" },
      {
        property: "og:description",
        content:
          "Kurasi teardown perangkat, benchmark riil, dan rujukan suku cadang orisinil dari meja kerja teknisi Buana Computer.",
      },
      { property: "og:image", content: "https://buanacomputer.web.id/Buanacomputer-logo.png" },
      { property: "og:url", content: "https://buanacomputer.web.id/blog" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://buanacomputer.web.id/blog" }],
  }),
  component: BlogPage,
});

const WA_CONSULT =
  "https://wa.me/6285979220599?text=Halo%20Buana%20Computer%2C%20saya%20mau%20konsultasi%20hardware";

const labStats = [
  { value: "1,850+", label: "PC Dirakit", sub: "Sejak 2019", accent: true },
  { value: "4.9/5", label: "Ulasan Google", sub: "Bantul & DIY", accent: false },
  { value: "100%", label: "Part Orisinil", sub: "Garansi Resmi", accent: true },
  { value: "FREE", label: "Konsultasi", sub: "Via WhatsApp", accent: false },
];

function tagBadgeClasses(tone: TagTone): string {
  if (tone === "sec") return "bg-sec-fixed/30 text-sec";
  if (tone === "tertiary") return "bg-tertiary-fixed/40 text-tertiary";
  return "bg-pri-fixed/40 text-pri";
}

function AnnouncementBar() {
  return (
    <div className="w-full bg-surface-high px-4 py-2 text-on-surface">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2">
        <div className="font-monotech flex items-center gap-2 text-[11px]">
          <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-pri" />
          <span className="font-semibold tracking-wide">EDISI KHUSUS 2025:</span>
          <span className="font-normal text-on-surface-variant">
            Panduan Komprehensif Rakit PC &amp; Lab Servis Buana Komputer Yogyakarta
          </span>
        </div>
        <div className="font-monotech hidden items-center gap-2 text-[11px] text-on-surface-variant sm:flex">
          <span>KONSULTASI &amp; SERVIS AKTIF</span>
          <span className="text-outline-variant">•</span>
          <span className="font-medium text-pri">BANTUL, D.I. YOGYAKARTA</span>
        </div>
      </div>
    </div>
  );
}

function HeroStory({ article }: { article: BlogArticle }) {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-6 sm:py-10">
      <div className="rounded-xl bg-surface-lowest p-5 sm:p-6 md:p-10 shadow-md transition-all duration-300 hover:shadow-xl">
        <div className="grid grid-cols-1 items-center gap-6 sm:gap-8 lg:grid-cols-12 lg:gap-10">
          <Reveal className="flex flex-col items-start lg:col-span-7">
            <div className="font-monotech mb-3 flex items-center gap-2 text-[11px]">
              <span className="rounded-full bg-pri px-3 py-0.5 font-semibold uppercase tracking-wider text-on-pri">
                {article.tag}
              </span>
              <span className="text-outline">•</span>
              <span className="text-outline">LAB TESTED</span>
            </div>
            <h1 className="font-heading mb-3 sm:mb-4 text-xl sm:text-3xl lg:text-4xl font-bold leading-tight tracking-tight text-on-surface">
              {article.title}
            </h1>
            <p className="mb-5 sm:mb-6 text-sm sm:text-base leading-relaxed text-on-surface-variant">
              {article.excerpt}
            </p>
            {article.heroSpecs && (
              <div className="mb-5 sm:mb-6 grid w-full grid-cols-3 gap-1.5 sm:gap-2 rounded-lg bg-surface-low p-3 sm:p-4">
                {article.heroSpecs.map((s) => (
                  <div key={s.label}>
                    <span className="font-monotech block text-[10px] sm:text-[11px] uppercase tracking-wider text-outline truncate">
                      {s.label}
                    </span>
                    <span className="font-heading text-sm sm:text-base lg:text-xl font-semibold text-on-surface truncate block">
                      {s.value}
                    </span>
                  </div>
                ))}
              </div>
            )}
            <div className="flex w-full flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="font-monotech flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-surface-high text-xs font-bold text-pri shrink-0">
                  {article.author
                    .split(" ")
                    .map((w) => w[0])
                    .slice(0, 2)
                    .join("")}
                </div>
                <div className="flex flex-col">
                  <span className="font-heading text-sm sm:text-[15px] font-semibold leading-tight text-on-surface">
                    {article.author}
                  </span>
                  <span className="font-monotech text-[10px] sm:text-[11px] text-outline">
                    {article.readMinutes} min baca • {article.date}
                  </span>
                </div>
              </div>
              <Link
                to="/blog/$articleId"
                params={{ articleId: article.slug }}
                className="font-heading inline-flex items-center justify-center gap-2 rounded-lg bg-pri px-5 py-2.5 text-xs sm:text-sm font-semibold text-on-pri shadow-sm transition-all hover:bg-pri-container w-full sm:w-auto"
              >
                {article.cta} <span aria-hidden>→</span>
              </Link>
            </div>
          </Reveal>
          <Reveal scale delayMs={150} className="relative lg:col-span-5">
            <div className="group relative aspect-[4/3] overflow-hidden rounded-lg bg-surface-high shadow-inner">
              <img
                src={article.image}
                alt={article.title}
                loading="eager"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-inverse-surface/80 via-transparent to-transparent p-4">
                <div className="font-monotech flex items-center justify-between text-[11px] text-on-pri">
                  <span className="rounded bg-inverse-surface/60 px-2 py-0.5 backdrop-blur-md">
                    {article.labLabel}: {article.labValue}
                  </span>
                  <span className="text-sec-fixed">Thermal Delta: -14.2°C</span>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-4 -left-4 hidden max-w-xs items-center gap-3 rounded-lg bg-surface-lowest p-3 shadow-lg sm:flex">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-pri-fixed/40 font-bold text-pri">
                ✓
              </span>
              <div>
                <p className="font-heading text-[13px] font-semibold leading-tight text-on-surface">
                  QC Buana Computer Verified
                </p>
                <p className="font-monotech text-[11px] leading-tight text-outline">
                  Lolos uji stres sintetis 72 jam nonstop
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function ArticleCard({ article }: { article: BlogArticle }) {
  return (
    <Link
      to="/blog/$articleId"
      params={{ articleId: article.slug }}
      className="group flex flex-col overflow-hidden rounded-lg bg-surface-lowest shadow-sm transition-all duration-200 hover:shadow-md"
    >
      <div className="relative aspect-video w-full overflow-hidden bg-surface-high">
        <img
          src={article.image.replace("/1200/520", "/800/450")}
          alt={article.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3">
          <span
            className={`font-monotech rounded bg-surface-lowest/90 px-2 py-0.5 text-[11px] font-semibold shadow-sm backdrop-blur-sm ${tagBadgeClasses(article.tagTone).split(" ")[1] ?? "text-pri"}`}
          >
            {article.tag}
          </span>
        </div>
        <div className="absolute bottom-2 right-2">
          <span className="font-monotech rounded bg-inverse-surface/80 px-2 text-[11px] text-inverse-on-surface">
            {article.labValue}
          </span>
        </div>
      </div>
      <div className="flex flex-grow flex-col p-5">
        <div className="font-monotech mb-2 flex items-center gap-2 text-[11px] text-outline">
          <span>{article.readMinutes} min baca</span>
          <span>•</span>
          <span>{article.date}</span>
        </div>
        <h3 className="font-heading mb-2 text-lg font-semibold leading-snug text-on-surface transition-colors group-hover:text-pri">
          {article.title}
        </h3>
        <p className="mb-4 line-clamp-3 text-sm leading-relaxed text-on-surface-variant">
          {article.excerpt}
        </p>
        <div className="font-monotech mt-auto flex items-center justify-between rounded bg-surface-low px-3 py-2 text-[11px]">
          <span className="font-semibold text-on-surface">
            {article.labLabel}: {article.labValue}
          </span>
          <span className="font-medium text-pri group-hover:underline">{article.cta} →</span>
        </div>
      </div>
    </Link>
  );
}

function Newsletter() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  return (
    <section className="mx-auto w-full max-w-7xl px-4 pb-8 sm:pb-10">
      <Reveal
        scale
        className="relative overflow-hidden rounded-xl bg-inverse-surface p-6 text-inverse-on-surface shadow-lg md:p-10"
      >
        <div className="pointer-events-none absolute -bottom-20 -right-20 h-80 w-80 rounded-full bg-pri-container/20 blur-3xl" />
        <div className="relative z-10 grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <div className="font-monotech mb-2 flex items-center gap-2 text-[11px] uppercase tracking-wider text-sec-fixed">
              <span aria-hidden>✉</span>
              <span>Buana Tech Dispatch • Setiap Jumat</span>
            </div>
            <h2 className="font-heading mb-2 text-2xl font-semibold sm:text-3xl">
              Dapatkan Analisis Hardware Terkini &amp; Solusi Teknis Teruji
            </h2>
            <p className="max-w-xl text-sm leading-relaxed text-surface-variant sm:text-base">
              Buletin mingguan panduan teknologi, analisa servis perangkat, dan rekomendasi komponen
              terbaik langsung ke inbox Anda. Bebas promosi kosong, murni intisari teknis.
            </p>
          </div>
          <div className="lg:col-span-5">
            {done ? (
              <div className="rounded-lg bg-surface-lowest p-4 text-sm font-medium text-on-surface">
                Terima kasih! Email <span className="font-semibold">{email}</span> terdaftar di
                Buana Tech Dispatch.
              </div>
            ) : (
              <form
                className="flex flex-col items-stretch gap-2 sm:flex-row"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (email.trim()) setDone(true);
                }}
              >
                <input
                  className="w-full rounded-lg bg-surface-lowest px-4 py-2.5 text-sm text-on-surface shadow-sm outline-none placeholder:text-outline focus:ring-2 focus:ring-pri"
                  placeholder="Masukkan alamat email aktif..."
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <button
                  className="font-heading shrink-0 rounded-lg bg-pri px-6 py-2.5 text-sm font-semibold text-on-pri shadow-sm transition-colors hover:bg-pri-container"
                  type="submit"
                >
                  Langganan
                </button>
              </form>
            )}
            <div className="font-monotech flex items-center gap-2 pt-3 text-[11px] text-surface-variant">
              <span>Privasi terjamin</span>
              <span>•</span>
              <span>Berhenti kapan saja dengan 1 klik</span>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "Beranda",
      item: "https://buanacomputer.web.id/",
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "Buana Journal",
      item: "https://buanacomputer.web.id/blog",
    },
  ],
};

function BlogPage() {
  const [category, setCategory] = useState<string>("Semua Topik");
  const featured = blogArticles[0]!;
  const list =
    category === "Semua Topik" ? blogArticles : blogArticles.filter((a) => a.category === category);

  return (
    <div className="min-h-screen bg-surface">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <SiteHeader />
      <AnnouncementBar />
      <HeroStory article={featured} />

      <section className="mx-auto w-full max-w-7xl px-4 pb-6">
        <Reveal className="flex flex-col justify-between gap-4 pb-3 md:flex-row md:items-center">
          <div>
            <h2 className="font-heading text-2xl font-semibold text-on-surface sm:text-3xl">
              Eksplorasi Topik &amp; Panduan
            </h2>
            <p className="text-sm text-on-surface-variant">
              Kurasi teardown perangkat, benchmark riil, dan rujukan suku cadang orisinil.
            </p>
          </div>
          <span className="font-monotech text-[11px] uppercase tracking-wider text-outline">
            Kategori: {blogCategories.length} Direktori
          </span>
        </Reveal>
        <div className="flex items-center gap-2 overflow-x-auto py-2 scrollbar-none">
          {blogCategories.map((c) => {
            const active = category === c;
            return (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`font-monotech shrink-0 rounded-full px-4 py-1.5 text-[13px] font-medium transition-colors ${
                  active
                    ? "bg-on-surface text-surface shadow-sm"
                    : "bg-surface-high text-on-surface-variant hover:bg-surface-highest hover:text-on-surface"
                }`}
              >
                {c}
              </button>
            );
          })}
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 pb-10">
        {list.length === 0 ? (
          <div className="rounded-xl bg-surface-lowest p-10 text-center shadow-sm">
            <p className="font-heading text-lg font-semibold text-on-surface">
              Artikel kategori ini segera hadir.
            </p>
            <p className="mt-1 text-sm text-on-surface-variant">
              Tim lab sedang menyiapkan panduan {category} — pantau Buana Tech Dispatch tiap Jumat.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {list.map((a, i) => (
              <Reveal key={a.slug} delayMs={(i % 3) * 90}>
                <ArticleCard article={a} />
              </Reveal>
            ))}
          </div>
        )}
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 pb-10">
        <div className="rounded-xl bg-surface-low p-6 md:p-10">
          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
            <div className="space-y-2 lg:col-span-5">
              <div className="font-monotech flex items-center gap-2 text-[11px] uppercase tracking-wider text-pri">
                <span aria-hidden>⚙</span>
                <span>Buana Service &amp; Custom Rig Lab</span>
              </div>
              <h3 className="font-heading text-2xl font-semibold text-on-surface sm:text-3xl">
                Transparansi Teknis, Garansi Penuh, &amp; Suku Cadang Terkurasi
              </h3>
              <p className="text-sm leading-relaxed text-on-surface-variant">
                Setiap ulasan dan panduan disusun langsung dari meja kerja teknisi. Mulai dari
                diagnosa motherboard, pergantian LCD laptop original, hingga rakitan PC workstation
                di gerai Bantul.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 text-center sm:grid-cols-4 lg:col-span-7">
              {labStats.map((s, i) => (
                <Reveal
                  key={s.label}
                  scale
                  delayMs={i * 80}
                  className="rounded-lg bg-surface-lowest p-4 shadow-sm"
                >
                  <span
                    className={`font-heading block text-2xl font-bold sm:text-3xl ${s.accent ? "text-pri" : "text-on-surface"}`}
                  >
                    {s.value}
                  </span>
                  <span className="font-monotech mt-1 block text-[11px] font-medium uppercase text-on-surface">
                    {s.label}
                  </span>
                  <span className="font-monotech text-[11px] text-outline">{s.sub}</span>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Newsletter />

      <section className="mx-auto w-full max-w-7xl px-4 pb-10">
        <Reveal className="flex flex-col items-center justify-between gap-4 rounded-xl bg-surface-lowest p-5 shadow-sm md:flex-row">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-surface-high text-xl text-pri">
              🛠
            </div>
            <div>
              <h4 className="font-heading font-semibold text-on-surface">
                Punya Masalah dengan Laptop, PC, atau Komponen?
              </h4>
              <p className="text-sm text-on-surface-variant">
                Kunjungi workshop kami di Bantul atau konsultasikan gejala kerusakan gratis via
                chat.
              </p>
            </div>
          </div>
          <a
            href={WA_CONSULT}
            target="_blank"
            rel="noreferrer"
            className="font-monotech inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-lg bg-surface-high px-4 py-2 text-[13px] font-medium text-on-surface transition-colors hover:bg-surface-highest md:w-auto"
          >
            <span className="text-pri">💬</span> Konsultasi WA: 0859-7922-0599
          </a>
        </Reveal>
      </section>

      <SiteFooter />
    </div>
  );
}
