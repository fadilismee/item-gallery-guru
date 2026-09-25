import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { getArticle, relatedArticles, type BlogSection, type TagTone } from "@/data/blog";

export const Route = createFileRoute("/blog/$articleId")({
  loader: ({ params }) => {
    const article = getArticle(params.articleId);
    if (!article) throw redirect({ to: "/blog" });
    return { article };
  },
  head: ({ loaderData }) => {
    if (!loaderData || !loaderData.article) {
      return {
        meta: [
          { title: "Artikel tidak ditemukan — Buana Journal" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const { article } = loaderData;
    return {
      meta: [
        { title: `${article.title} — Buana Journal` },
        { name: "description", content: article.excerpt },
        {
          name: "keywords",
          content: [
            article.category,
            article.tag.toLowerCase(),
            ...article.tags.map((t) => t.replace(/^#/, "")),
            "buana journal",
            "bantul",
            "yogyakarta",
          ].join(", "),
        },
        { property: "og:title", content: article.title },
        { property: "og:description", content: article.excerpt },
        { property: "og:image", content: article.image },
        {
          property: "og:url",
          content: `https://buanacomputer.web.id/blog/${article.slug}`,
        },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [
        {
          rel: "canonical",
          href: `https://buanacomputer.web.id/blog/${article.slug}`,
        },
      ],
    };
  },
  component: ArticlePage,
});

const WA_CONSULT =
  "https://wa.me/6285979220599?text=Halo%20Buana%20Computer%2C%20saya%20mau%20konsultasi%20teknisi";

function toneText(tone: TagTone): string {
  if (tone === "sec") return "text-sec";
  if (tone === "tertiary") return "text-tertiary";
  return "text-pri";
}

function ReadingProgress() {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement;
      const total = el.scrollHeight - el.clientHeight;
      setWidth(total > 0 ? (el.scrollTop / total) * 100 : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <div className="fixed left-0 top-0 z-50 h-1 w-full bg-surface-low">
      <div className="h-full bg-pri transition-all duration-150" style={{ width: `${width}%` }} />
    </div>
  );
}

function SectionBlock({ section, anchor }: { section: BlogSection; anchor?: string }) {
  switch (section.kind) {
    case "lead":
      return <p className="text-lg font-medium leading-loose text-on-surface">{section.text}</p>;
    case "spec":
      return (
        <div className="space-y-3 rounded-xl bg-surface-lowest p-5 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <span className="font-monotech text-[11px] font-bold uppercase tracking-wider text-pri">
              {section.title}
            </span>
            <span className="font-monotech rounded bg-sec-fixed/40 px-2 py-0.5 text-[11px] text-on-sec-fixed">
              {section.badge}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-1 sm:grid-cols-4">
            {section.items.map((it) => (
              <div key={it.label} className="rounded-lg bg-surface-low p-2">
                <span className="font-monotech block text-[11px] text-outline">{it.label}</span>
                <span className="font-monotech block text-[13px] font-semibold text-on-surface">
                  {it.value}
                </span>
                <span className="block text-[11px] text-on-surface-variant">{it.sub}</span>
              </div>
            ))}
          </div>
        </div>
      );
    case "part":
      return (
        <section id={anchor} className="scroll-mt-24 space-y-4">
          <div className="flex items-center gap-2">
            <span className="font-monotech text-[11px] font-bold text-pri">
              {section.index} / {section.eyebrow}
            </span>
            <div className="h-0.5 w-12 bg-pri-container" />
          </div>
          <h2 className="font-heading text-2xl font-semibold tracking-tight text-on-surface sm:text-3xl">
            {section.title}
          </h2>
          {section.paragraphs.map((p, i) => (
            <p key={i} className="leading-relaxed text-on-surface-variant">
              {p}
            </p>
          ))}
        </section>
      );
    case "advice":
      return (
        <div className="space-y-2 rounded-xl bg-surface-container p-5">
          <h4 className="font-heading flex items-center gap-2 font-semibold text-on-surface">
            <span className="text-pri">💡</span> {section.title}
          </h4>
          <p className="text-sm leading-relaxed text-on-surface-variant">{section.text}</p>
        </div>
      );
    case "chart":
      return (
        <div className="space-y-4 rounded-xl bg-surface-lowest p-5 shadow-sm">
          <div className="flex flex-col justify-between gap-1 sm:flex-row sm:items-center">
            <h3 className="font-heading font-semibold text-on-surface">{section.title}</h3>
            <span className="font-monotech text-[11px] text-outline">{section.hint}</span>
          </div>
          <div className="space-y-3 pt-1">
            {section.bars.map((b) => (
              <div key={b.label}>
                <div className="font-monotech mb-1 flex justify-between text-[11px]">
                  <span className="font-semibold text-on-surface">{b.label}</span>
                  <span className={b.highlight ? "font-bold text-pri" : "text-on-surface-variant"}>
                    {b.value}
                  </span>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full bg-surface-container">
                  <div
                    className={`h-full rounded-full ${b.highlight ? "bg-pri-container" : "bg-surface-dim"}`}
                    style={{ width: `${b.width}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <p className="pt-1 text-sm text-on-surface-variant">{section.caption}</p>
        </div>
      );
    case "quote":
      return (
        <blockquote className="rounded-xl bg-surface-lowest p-6 shadow-sm">
          <div className="flex gap-4">
            <span className="shrink-0 select-none text-4xl text-pri" aria-hidden>
              &ldquo;
            </span>
            <div className="space-y-2">
              <p className="font-heading text-xl font-normal italic leading-relaxed text-on-surface">
                {section.text}
              </p>
              <cite className="font-monotech block text-[13px] font-semibold not-italic text-pri">
                {section.cite}
              </cite>
            </div>
          </div>
        </blockquote>
      );
    case "takeaway":
      return (
        <div className="grid grid-cols-1 gap-4 pt-1 sm:grid-cols-2">
          {section.items.map((t) => (
            <div key={t.title} className="space-y-2 rounded-xl bg-surface-low p-5">
              <div className="font-heading flex items-center gap-2 font-semibold text-pri">
                <span aria-hidden>❄</span>
                <span>{t.title}</span>
              </div>
              <p className="text-sm leading-relaxed text-on-surface-variant">{t.text}</p>
            </div>
          ))}
        </div>
      );
  }
}

function ShareButtons({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
    } catch {
      /* clipboard unavailable */
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={copy}
        title="Salin Tautan"
        className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-container text-on-surface transition-colors hover:bg-pri hover:text-on-pri"
      >
        {copied ? "✓" : "⧉"}
      </button>
      <a
        href={`https://wa.me/6285979220599?text=${encodeURIComponent(`Halo, saya mau diskusi artikel: ${title}`)}`}
        target="_blank"
        rel="noreferrer"
        title="Diskusi via WA"
        className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-container text-on-surface transition-colors hover:bg-pri hover:text-on-pri"
      >
        💬
      </a>
      <button
        onClick={() => setSaved((v) => !v)}
        title="Simpan Artikel"
        className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${saved ? "bg-pri text-on-pri" : "bg-surface-container text-on-surface hover:bg-pri hover:text-on-pri"}`}
      >
        {saved ? "★" : "☆"}
      </button>
    </div>
  );
}

function ArticlePage() {
  const { article } = Route.useLoaderData();
  const [helpful, setHelpful] = useState(false);
  const related = relatedArticles(article.slug, 3);
  const toc = article.sections
    .map((s, i) => ({ s, i }))
    .filter(({ s }) => s.kind === "part")
    .map(({ s, i }) => ({
      anchor: `section-${i}`,
      label: s.kind === "part" ? s.title.replace(/^\d+\.\s*/, `${i + 1}. `) : "",
    }));

  let partCount = 0;
  const anchors = article.sections.map((s) => {
    if (s.kind !== "part") return undefined;
    partCount += 1;
    return `section-${partCount}`;
  });

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
      {
        "@type": "ListItem",
        position: 3,
        name: article.category,
        item: "https://buanacomputer.web.id/blog",
      },
      {
        "@type": "ListItem",
        position: 4,
        name: article.title,
        item: `https://buanacomputer.web.id/blog/${article.slug}`,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-surface">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <SiteHeader />
      <ReadingProgress />

      <article className="mx-auto w-full max-w-7xl px-4 py-8">
        <header className="max-w-4xl space-y-4">
          <nav className="font-monotech flex items-center gap-2 text-[13px] text-on-surface-variant">
            <Link to="/blog" className="transition-colors hover:text-pri">
              Beranda
            </Link>
            <span className="text-outline">›</span>
            <span className="transition-colors hover:text-pri">{article.category}</span>
            <span className="text-outline">›</span>
            <span className="text-on-surface">Panduan Rakit</span>
          </nav>
          <div className="font-monotech flex flex-wrap items-center gap-2 pt-1 text-[11px]">
            <span className="rounded-full bg-pri-container px-3 py-0.5 font-semibold uppercase tracking-wider text-on-pri">
              {article.tag}
            </span>
            <span className="rounded-full bg-surface-high px-3 py-0.5 text-on-surface">
              {article.serial}
            </span>
            <span className="flex items-center gap-1 text-outline">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-sec-container" />
              VERIFIKASI BENCHMARK
            </span>
          </div>
          <h1 className="font-heading pt-1 text-2xl font-bold leading-tight tracking-tight text-on-surface sm:text-4xl">
            {article.title}
          </h1>
          <p className="text-base sm:text-lg leading-relaxed text-on-surface-variant">
            {article.excerpt}
          </p>

          <div className="flex flex-col justify-between gap-4 rounded-xl bg-surface-lowest p-4 shadow-sm md:flex-row md:items-center">
            <div className="flex items-center gap-3">
              <div className="font-monotech flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-surface-container text-sm font-bold text-pri">
                {article.author === "Budi Santoso" ? "BS" : "BK"}
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <span className="font-heading font-semibold leading-snug text-on-surface">
                    {article.author}
                  </span>
                  <span className="text-base text-pri">✓</span>
                </div>
                <p className="text-sm text-on-surface-variant">{article.role}</p>
              </div>
            </div>
            <div className="font-monotech flex flex-wrap items-center gap-4 text-[11px] text-on-surface-variant">
              <span>📅 {article.date}</span>
              <span>⏱ {article.readMinutes} Menit Baca</span>
              <span>👁 {article.readers}</span>
              <ShareButtons title={article.title} />
            </div>
          </div>
        </header>

        <figure className="my-6 sm:my-8 w-full">
          <div className="relative aspect-[16/9] sm:aspect-[21/9] w-full overflow-hidden rounded-xl bg-surface-container shadow-sm">
            <img
              src={article.image}
              alt={article.title}
              loading="eager"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-6 sm:right-6 flex flex-col items-start justify-between gap-1.5 sm:gap-2 text-white sm:flex-row sm:items-center">
              <div className="font-monotech flex items-center gap-2 text-[10px] sm:text-[11px]">
                <span aria-hidden>📷</span>
                <span>Dokumentasi lab Buana Computer Bantul.</span>
              </div>
              <span className="font-monotech rounded bg-black/40 px-2.5 py-0.5 text-[10px] sm:text-[11px] text-slate-200 backdrop-blur-md">
                {article.labLabel}: {article.labValue}
              </span>
            </div>
          </div>
          <figcaption className="font-monotech mt-2 text-center text-[11px] italic text-outline sm:text-left">
            Setiap unit rakitan melalui stress-test 100% load selama 48 jam sebelum penyerahan
            garansi resmi.
          </figcaption>
        </figure>

        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
          <main className="space-y-8 lg:col-span-8">
            {article.sections.map((s, i) => (
              <SectionBlock key={i} section={s} anchor={anchors[i]} />
            ))}

            <div className="flex flex-wrap items-center gap-2 pt-2">
              <span className="font-monotech mr-2 text-[11px] text-outline">Topik Terkait:</span>
              {article.tags.map((t) => (
                <span
                  key={t}
                  className="rounded-lg bg-surface-container px-3 py-1 font-monotech text-[11px] text-on-surface"
                >
                  {t}
                </span>
              ))}
            </div>

            <div className="flex flex-col items-center justify-between gap-4 rounded-xl bg-surface-lowest p-4 shadow-sm sm:flex-row">
              <div className="space-y-0.5 text-center sm:text-left">
                <span className="font-heading block font-semibold text-on-surface">
                  Apakah panduan ini membantu?
                </span>
                <span className="text-sm text-on-surface-variant">
                  Bantu kami meningkatkan kualitas laboratorium konten.
                </span>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  onClick={() => setHelpful((v) => !v)}
                  className={`font-heading flex items-center gap-2 rounded-lg px-4 py-2 text-sm transition-colors ${helpful ? "bg-pri text-on-pri" : "bg-surface-container text-on-surface hover:bg-pri hover:text-on-pri"}`}
                >
                  👍 Bermanfaat{helpful ? " ✓" : ""}
                </button>
                <a
                  href={WA_CONSULT}
                  target="_blank"
                  rel="noreferrer"
                  className="font-heading flex items-center gap-2 rounded-lg bg-surface-container px-4 py-2 text-sm text-on-surface transition-colors hover:bg-surface-high"
                >
                  💬 Diskusi
                </a>
              </div>
            </div>
          </main>

          <aside className="space-y-6 lg:sticky lg:top-24 lg:col-span-4">
            <div className="space-y-3 rounded-xl bg-surface-lowest p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="font-monotech flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-surface-container text-base font-bold text-pri">
                  {article.author === "Budi Santoso" ? "BS" : "BK"}
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-on-surface">{article.author}</h3>
                  <p className="font-monotech text-[11px] font-semibold text-pri">
                    {article.role.split("•")[0]}
                  </p>
                </div>
              </div>
              <p className="text-sm leading-relaxed text-on-surface-variant">
                Praktisi custom PC build dan diagnosa motherboard dengan pengalaman lebih dari 10
                tahun di Yogyakarta. Menguji ratusan rig untuk kreator, streamer, dan profesional.
              </p>
              <Link
                to="/about"
                className="font-monotech inline-flex items-center gap-1 text-[13px] font-medium text-pri transition-colors hover:text-pri-container"
              >
                Lihat Profil Lab &amp; Bengkel <span aria-hidden>→</span>
              </Link>
            </div>

            {toc.length > 0 && (
              <div className="space-y-3 rounded-xl bg-surface-lowest p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="font-heading flex items-center gap-2 font-semibold text-on-surface">
                    <span className="text-pri">📖</span> Daftar Isi
                  </h3>
                  <span className="font-monotech text-[11px] text-outline">
                    {toc.length} Bagian
                  </span>
                </div>
                <nav className="space-y-1 pt-1 text-sm">
                  {toc.map((t) => (
                    <a
                      key={t.anchor}
                      href={`#${t.anchor}`}
                      className="block rounded-lg px-2 py-1.5 text-on-surface-variant transition-colors hover:bg-surface-low hover:text-pri"
                    >
                      {t.label}
                    </a>
                  ))}
                </nav>
              </div>
            )}

            <div className="relative space-y-4 overflow-hidden rounded-xl bg-gradient-to-br from-pri via-pri to-sec p-6 text-on-pri shadow-lg">
              <div className="space-y-2">
                <span className="font-monotech inline-block rounded bg-white/20 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider backdrop-blur">
                  Konsultasi Gratis
                </span>
                <h3 className="font-heading text-xl font-bold leading-snug">
                  Punya Masalah PC atau Mau Rakit Custom?
                </h3>
                <p className="text-sm leading-relaxed text-white/90">
                  Bawa perangkat Anda ke lab Buana Computer Bantul atau chat teknisi kami untuk
                  simulasi spesifikasi tepat budget Anda.
                </p>
              </div>
              <div className="font-monotech space-y-2 text-[11px] text-white/90">
                <div className="flex items-center gap-2">
                  <span className="text-sec-fixed">✓</span>
                  <span>Tim Lab Berpengalaman • Garansi Toko Resmi</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sec-fixed">✓</span>
                  <span>Komponen 100% Original Bergaransi</span>
                </div>
              </div>
              <a
                href={WA_CONSULT}
                target="_blank"
                rel="noreferrer"
                className="font-heading flex w-full items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-pri shadow-md transition-colors hover:bg-slate-100"
              >
                💬 Chat WhatsApp Teknisi
              </a>
            </div>

            <div className="space-y-4 rounded-xl bg-surface-lowest p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="font-heading font-semibold text-on-surface">Artikel Terkait</h3>
                <Link to="/blog" className="font-monotech text-[11px] text-pri hover:underline">
                  Semua
                </Link>
              </div>
              <div className="space-y-4">
                {related.map((r) => (
                  <Link
                    key={r.slug}
                    to="/blog/$articleId"
                    params={{ articleId: r.slug }}
                    className="group flex items-start gap-3"
                  >
                    <div className="h-16 w-20 shrink-0 overflow-hidden rounded-lg bg-surface-container">
                      <img
                        src={r.image.replace("/1200/520", "/400/320")}
                        alt={r.title}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    <div className="min-w-0 space-y-1">
                      <span className={`font-monotech text-[11px] ${toneText(r.tagTone)}`}>
                        {r.tag}
                      </span>
                      <h4 className="line-clamp-2 text-sm font-semibold leading-snug text-on-surface transition-colors group-hover:text-pri">
                        {r.title}
                      </h4>
                      <span className="font-monotech block text-[11px] text-outline">
                        {r.readMinutes} min baca
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </article>

      <SiteFooter />
    </div>
  );
}
