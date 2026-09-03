import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Pagina non trovata" };

const sections = [
  ["Articoli", "/articoli"],
  ["Eventi", "/eventi"],
  ["Timeline", "/timeline"],
  ["Servizi", "/servizi"],
  ["Chi siamo?", "/chi-siamo"],
] as const;

export default function NotFound() {
  return (
    <section className="page-hero shell not-found">
      <span className="eyebrow">Errore 404</span>
      <h1>Pagina non trovata.</h1>
      <p>Il link potrebbe essere cambiato con il nuovo sito. Riparti da una delle sezioni.</p>
      <nav className="related-nav" aria-label="Sezioni del sito">
        <Link href="/">Home ↗</Link>
        {sections.map(([label, href]) => <Link href={href} key={href}>{label} ↗</Link>)}
      </nav>
    </section>
  );
}
