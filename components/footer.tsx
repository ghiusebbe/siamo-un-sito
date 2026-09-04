import Link from "next/link";
import { getSiteSettings } from "@/lib/content";
import Image from "@/components/site-image";
import { ConsentLink } from "@/components/consent-link";
import { NewTabNote } from "@/components/new-tab-note";

const sections = [
  ["Articoli", "/articoli"],
  ["Eventi", "/eventi"],
  ["Timeline", "/timeline"],
  ["Servizi", "/servizi"],
  ["Chi siamo?", "/chi-siamo"],
] as const;

export async function Footer() {
  const settings = await getSiteSettings();

  return (
    <footer className="footer shell">
      <nav className="footer-nav" aria-label="Sezioni del sito">
        <span className="eyebrow">Esplora</span>
        {sections.map(([label, href]) => <Link href={href} key={href}>{label}</Link>)}
        <ConsentLink />
      </nav>
      <div>
        <span className="eyebrow">Email</span>
        <a href={`mailto:${settings.email}`}>{settings.email}</a>
      </div>
      <div>
        <span className="eyebrow">Instagram</span>
        <a href={settings.instagramUrl} target="_blank" rel="noreferrer">
          {settings.instagramHandle} ↗<NewTabNote />
        </a>
      </div>
      <div className="footer-mark">
        <Link className="footer-brand-link" href="/" aria-label="SIAMO, homepage">
          <Image src="/brand/siamo-symbol-white.png" alt="" width={900} height={730} sizes="112px" />
        </Link>
        <span>© {new Date().getFullYear()} {settings.title}</span>
      </div>
    </footer>
  );
}
