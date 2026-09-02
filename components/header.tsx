import Link from "next/link";

const links = [
  ["Articoli", "/articoli"],
  ["Eventi", "/eventi"],
  ["Timeline", "/timeline"],
  ["Servizi", "/servizi"],
  ["Chi siamo?", "/chi-siamo"],
] as const;

export function Header() {
  return (
    <header className="site-header shell">
      <div className="header-brand-row">
        <Link className="brand-link" href="/" aria-label="SIAMO, homepage">
          SIAMO <span>(UN SITO)</span>
        </Link>
        <span className="header-index">INDIPENDENTE · ITALIA</span>
      </div>

      <nav className="desktop-nav" aria-label="Navigazione principale">
        {links.map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}
        <a href="https://www.instagram.com/siamounmagazine/" target="_blank" rel="noreferrer">Instagram ↗</a>
      </nav>

      <details className="mobile-nav">
        <summary>Menu <span aria-hidden="true">+</span></summary>
        <nav aria-label="Navigazione mobile">
          {links.map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}
          <a href="https://www.instagram.com/siamounmagazine/" target="_blank" rel="noreferrer">Instagram ↗</a>
        </nav>
      </details>
    </header>
  );
}
