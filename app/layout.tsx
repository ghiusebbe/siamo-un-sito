import type { Metadata } from "next";
import { preload } from "react-dom";
import "./globals.css";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { SiteChrome } from "@/components/site-chrome";
import { SiteIntro } from "@/components/site-intro";
import { adsenseAccount } from "@/lib/advertising";
import { INTRO_STORAGE_KEY } from "@/lib/intro";
import { StructuredData } from "@/components/structured-data";
import { homeTitle, siteDescription, siteStructuredData } from "@/lib/seo";
import { siteUrl } from "@/lib/site-url";

// Runs before first paint: decides whether the entry animation plays this session.
const introScript = `try{document.documentElement.dataset.intro=sessionStorage.getItem(${JSON.stringify(INTRO_STORAGE_KEY)})?"skip":"play"}catch(e){document.documentElement.dataset.intro="play"}`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: homeTitle,
    template: "%s — SIAMO",
  },
  description: siteDescription,
  twitter: { card: "summary_large_image" },
};

const fontPreloadOptions = { as: "font", type: "font/woff2", crossOrigin: "anonymous" } as const;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  // Both cuts sit on the critical path of every heading: fetch them with the HTML.
  preload("/fonts/Helvetica-Regular.woff2", fontPreloadOptions);
  preload("/fonts/Helvetica-Bold.woff2", fontPreloadOptions);
  // AdSense verifies ownership and serves through this tag on every page; the
  // consent message still gates what it may request. React hoists it to head.
  const adsense = adsenseAccount();

  return (
    <html lang="it" suppressHydrationWarning>
      <body>
        <StructuredData data={siteStructuredData} />
        {/* The icon lives in public/ and is linked directly: as an app/icon.png
            file convention (or a metadata.icons entry) Next resolves it against
            metadataBase, which shipped an absolute href pointing at another
            origin — localhost when SITE_URL was unset, the production domain on
            a preview build. Root-relative is right on whatever host serves it. */}
        <link rel="alternate" type="application/rss+xml" title="SIAMO — articoli" href="/feed.xml" />
        <link rel="icon" href="/icon.png" type="image/png" sizes="512x512" />
        {adsense ? (
          <script
            async
            crossOrigin="anonymous"
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsense.clientId}`}
          />
        ) : null}
        <script dangerouslySetInnerHTML={{ __html: introScript }} />
        <SiteChrome>
          <SiteIntro />
          <a className="skip-link" href="#contenuto">Vai al contenuto</a>
          <Header />
        </SiteChrome>
        <main id="contenuto">{children}</main>
        <SiteChrome>
          <Footer />
        </SiteChrome>
      </body>
    </html>
  );
}
