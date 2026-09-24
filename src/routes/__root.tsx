import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import type { ReactNode } from "react";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "theme-color", content: "#000000" },
      {
        name: "google-site-verification",
        content: "D9D4lVIRUuQ1KP4nHWeOJWaH5SgfFGUJf1bpLSFjkEY",
      },
      { title: "Buana Computer Store — Toko Laptop & PC Bantul Yogyakarta" },
      {
        name: "description",
        content:
          "Toko komputer & laptop Bantul, Yogyakarta: laptop second teruji, PC rakitan gaming & kerja, monitor, komponen, dan storage sentinel 100% bergaransi toko resmi. WA 6285979220599.",
      },
      {
        name: "keywords",
        content:
          "buana computer store, toko komputer bantul, jual laptop bekas yogyakarta, pc rakitan jogja, toko laptop banguntapan, beli komponen pc jogja",
      },
      { name: "author", content: "Buana Computer Store" },
      { property: "og:title", content: "Buana Computer Store - Toko Laptop & PC Bantul" },
      {
        property: "og:description",
        content:
          "Jelajahi katalog Buana Computer Store — laptop second pilihan, PC rakitan custom, monitor IPS, dan komponen hardware bergaransi resmi.",
      },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "Buana Computer Store" },
      { property: "og:locale", content: "id_ID" },
      { property: "og:image", content: "https://buanacomputer.web.id/Buanacomputer-logo.png" },
      { property: "og:url", content: "https://buanacomputer.web.id" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Buana Computer Store - Toko Laptop & PC Bantul" },
      {
        name: "twitter:description",
        content:
          "Jelajahi katalog Buana Computer Store — laptop second pilihan, PC rakitan custom, monitor IPS, dan komponen hardware bergaransi resmi.",
      },
      { name: "twitter:image", content: "https://buanacomputer.web.id/Buanacomputer-logo.png" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=Space+Grotesk:wght@400;500;600;700&display=swap",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap",
      },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "icon", href: "/favicon.png", type: "image/png" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
      { rel: "manifest", href: "/manifest.json" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": "https://buanacomputer.web.id/#website",
  name: "Buana Computer Store",
  alternateName: ["Buana Komputer", "Buana Computer Bantul", "Buanacomp Store"],
  url: "https://buanacomputer.web.id",
  inLanguage: "id-ID",
  description:
    "Toko komputer Bantul Yogyakarta: katalog laptop bekas & baru, PC rakitan custom, monitor IPS, dan komponen hardware bergaransi resmi.",
};

const siteNavigationJsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  itemListElement: [
    {
      "@type": "SiteNavigationElement",
      position: 1,
      name: "Katalog Laptop & PC",
      description: "Katalog laptop second teruji, PC rakitan gaming & kerja, monitor, dan storage",
      url: "https://buanacomputer.web.id/",
    },
    {
      "@type": "SiteNavigationElement",
      position: 2,
      name: "Buana Journal & Tips Hardware",
      description:
        "Panduan rakit PC, review benchmark, dan tips perawatan laptop dari meja teknisi",
      url: "https://buanacomputer.web.id/blog",
    },
    {
      "@type": "SiteNavigationElement",
      position: 3,
      name: "Tentang Buana Computer Store",
      description:
        "Profil gerai komputer Bantul, standar pengujian kualitas, fasilitas toko, dan garansi resmi",
      url: "https://buanacomputer.web.id/about",
    },
  ],
};

const localBusinessJsonLd = {
  "@context": "https://schema.org",
  "@type": "ComputerStore",
  name: "Buana Computer Store",
  image: "https://buanacomputer.web.id/Buanacomputer-logo.png",
  url: "https://buanacomputer.web.id",
  telephone: "+6285979220599",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Mertosan Kulon, Potorono",
    addressLocality: "Banguntapan, Bantul",
    addressRegion: "DI Yogyakarta",
    postalCode: "55196",
    addressCountry: "ID",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: -7.8372069,
    longitude: 110.4148331,
  },
  openingHoursSpecification: {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    opens: "09:00",
    closes: "20:00",
  },
  priceRange: "Rp 150.000 - Rp 25.000.000",
  sameAs: [
    "https://www.tokopedia.com/bmccomp",
    "https://buanacomputer.web.id/blog",
    "https://buanacomputer.web.id/about",
  ],
};

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="id">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteNavigationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
        />
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
    </QueryClientProvider>
  );
}
