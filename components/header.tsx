"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const links = [
  ["Articoli", "/articoli"],
  ["Eventi", "/eventi"],
  ["Timeline", "/timeline"],
  ["Servizi", "/servizi"],
  ["Chi siamo?", "/chi-siamo"],
] as const;

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Header() {
  const pathname = usePathname();
  const headerRef = useRef<HTMLElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [compact, setCompact] = useState(false);
  const headerClassName = ["site-header", compact && "is-compact", menuOpen && "menu-is-open"]
    .filter(Boolean)
    .join(" ");

  useEffect(() => {
    let frame = 0;

    const update = () => {
      const distance = document.documentElement.scrollHeight - window.innerHeight;
      const progress = distance > 0 ? Math.min(window.scrollY / distance, 1) : 0;
      headerRef.current?.style.setProperty("--scroll-progress", String(progress));
      setCompact(window.scrollY > 24);
      frame = 0;
    };

    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [menuOpen]);

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 981px)");
    const closeOnDesktop = (event: MediaQueryListEvent) => {
      if (event.matches) setMenuOpen(false);
    };
    desktop.addEventListener("change", closeOnDesktop);
    return () => desktop.removeEventListener("change", closeOnDesktop);
  }, []);

  return (
    <header ref={headerRef} className={headerClassName}>
      <div className="header-inner">
        <Link className="brand-link" href="/" aria-label="SIAMO, homepage">
          SIAMO <span>(UN SITO)</span>
        </Link>

        <nav className="desktop-nav" aria-label="Navigazione principale">
          {links.map(([label, href]) => (
            <Link key={href} href={href} aria-current={isActive(pathname, href) ? "page" : undefined}>
              {label}
            </Link>
          ))}
          <a className="desktop-social" href="https://www.instagram.com/siamounmagazine/" target="_blank" rel="noreferrer">
            IG ↗
          </a>
        </nav>

        <span className="header-index">INDIPENDENTE · ITALIA</span>

        <button
          className="mobile-menu-trigger"
          type="button"
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span>{menuOpen ? "Chiudi" : "Menu"}</span>
          <span className="menu-icon" aria-hidden="true" />
        </button>
      </div>

      <nav id="mobile-menu" className="mobile-nav" aria-label="Navigazione mobile" hidden={!menuOpen}>
        <div className="mobile-nav-inner">
          {links.map(([label, href], index) => (
            <Link
              key={href}
              href={href}
              aria-current={isActive(pathname, href) ? "page" : undefined}
              onClick={() => setMenuOpen(false)}
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{label}</strong>
              <span aria-hidden="true">↗</span>
            </Link>
          ))}
          <a className="mobile-instagram" href="https://www.instagram.com/siamounmagazine/" target="_blank" rel="noreferrer" onClick={() => setMenuOpen(false)}>
            <span>IG</span><strong>Instagram</strong><span aria-hidden="true">↗</span>
          </a>
        </div>
      </nav>

      <span className="header-progress" aria-hidden="true" />
    </header>
  );
}
