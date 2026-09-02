import type { Metadata } from "next";
import Image from "@/components/site-image";
import Link from "next/link";

export const metadata: Metadata = { title: "Chi siamo" };

export default function AboutPage() {
  return (
    <article className="about-page shell">
      <span className="eyebrow">Progetto editoriale indipendente</span>
      <h1>SIAMO</h1>
      <div className="about-grid">
        <p>SIAMO racconta la scena musicale e culturale italiana con un focus su ciò che è emergente.</p>
        <Image
          src="/media/community.webp"
          alt="La comunità SIAMO durante un evento"
          width={1200}
          height={1000}
          sizes="(max-width: 620px) 100vw, 50vw"
          priority
        />
        <p>Dalla carta agli eventi, SIAMO è una comunità che sostiene ciò che sta per nascere, crescere, esplodere.</p>
        <Image
          src="/media/service-content-2.jpg"
          alt="Produzione di contenuti SIAMO"
          width={1000}
          height={1200}
          sizes="(max-width: 620px) 100vw, 50vw"
        />
      </div>
      <div className="about-cta"><span>Vuoi costruire qualcosa con noi?</span><Link href="/servizi">Scopri SIAMO Studio ↗</Link></div>
    </article>
  );
}
