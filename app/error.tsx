"use client";

import Link from "next/link";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <section className="page-hero shell not-found error-page">
      <span className="eyebrow">Qualcosa è andato storto</span>
      <h1>Pagina non disponibile.</h1>
      <p>Un errore ha interrotto il caricamento. Puoi riprovare o tornare alla home.</p>
      <nav className="related-nav" aria-label="Azioni">
        <button className="acid-button" type="button" onClick={reset}>Riprova</button>
        <Link href="/">Torna alla home ↗</Link>
      </nav>
    </section>
  );
}
