import type { Metadata } from "next";
import Link from "next/link";
import { getSiteSettings } from "@/lib/content";
import { isShopOnly } from "@/lib/shop";

export const metadata: Metadata = { title: "Pagina non trovata" };

const sections = [
  ["Articoli", "/articoli"],
  ["Eventi", "/eventi"],
  ["Timeline", "/timeline"],
  ["Servizi", "/servizi"],
  ["Chi siamo?", "/chi-siamo"],
] as const;

export default async function NotFound() {
  const shopOnly = isShopOnly(await getSiteSettings());
  return (
    <section className="page-hero shell not-found">
      <span className="eyebrow">Errore 404</span>
      <h1>Pagina non trovata.</h1>
      <p>{shopOnly ? "Il link potrebbe essere cambiato. Scopri il nuovo cartaceo nello shop." : "Il link potrebbe essere cambiato con il nuovo sito. Riparti da una delle sezioni."}</p>
      <nav className="related-nav" aria-label="Sezioni del sito">
        <Link href="/">Home ↗</Link>
        {shopOnly ? <Link href="/shop">Shop ↗</Link> : sections.map(([label, href]) => <Link href={href} key={href}>{label} ↗</Link>)}
      </nav>
    </section>
  );
}
