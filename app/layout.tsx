import type { Metadata } from "next";
import { preload } from "react-dom";
import "./globals.css";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { SiteIntro } from "@/components/site-intro";
import { INTRO_STORAGE_KEY } from "@/lib/intro";

// Runs before first paint: decides whether the entry animation plays this session.
const introScript = `try{document.documentElement.dataset.intro=sessionStorage.getItem(${JSON.stringify(INTRO_STORAGE_KEY)})?"skip":"play"}catch(e){document.documentElement.dataset.intro="play"}`;

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: {
    default: "SIAMO — musica e cultura emergente",
    template: "%s — SIAMO",
  },
  description:
    "Progetto editoriale indipendente che racconta la scena musicale e culturale italiana emergente.",
  openGraph: {
    title: "SIAMO",
    description: "Musica, cultura emergente, carta ed eventi.",
    locale: "it_IT",
    type: "website",
  },
};

const fontPreloadOptions = { as: "font", type: "font/woff2", crossOrigin: "anonymous" } as const;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  // Both cuts sit on the critical path of every heading: fetch them with the HTML.
  preload("/fonts/Helvetica-Regular.woff2", fontPreloadOptions);
  preload("/fonts/Helvetica-Bold.woff2", fontPreloadOptions);

  return (
    <html lang="it">
      <body>
        <script dangerouslySetInnerHTML={{ __html: introScript }} />
        <SiteIntro />
        <a className="skip-link" href="#contenuto">Vai al contenuto</a>
        <Header />
        <main id="contenuto">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
