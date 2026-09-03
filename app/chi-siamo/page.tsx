import type { Metadata } from "next";
import Image from "@/components/site-image";
import Link from "next/link";
import { DynamicTitle } from "@/components/dynamic-title";

export const metadata: Metadata = { title: "Chi siamo" };

export default function AboutPage() {
  return (
    <article className="about-page shell">
      <span className="eyebrow">Progetto editoriale indipendente</span>
      <div className="about-brand-lockup">
        <DynamicTitle as="h1" lines={["SIAMO"]} eager />
        <div className="about-brand-illustration" aria-hidden="true">
          <Image
            src="/brand/siamo-illustration.png"
            alt=""
            width={1500}
            height={1380}
            sizes="(max-width: 620px) 35vw, 28vw"
            priority
          />
        </div>
      </div>
      <div className="about-grid">
        <p>SIAMO racconta la scena musicale e culturale italiana con un focus su ciò che è emergente.</p>
        <Image
          src="/media/instagram/festival-recap.jpg"
          alt="Artista sul palco durante SIAMO il terzo festival"
          width={1080}
          height={1350}
          sizes="(max-width: 620px) 100vw, 50vw"
          priority
        />
        <p>Dalla carta agli eventi, SIAMO è una comunità che sostiene ciò che sta per nascere, crescere, esplodere.</p>
        <Image
          src="/media/instagram/hypersimposio-selton.jpg"
          alt="Tavola rotonda HyperSimposio con i Selton"
          width={720}
          height={1280}
          sizes="(max-width: 620px) 100vw, 50vw"
        />
      </div>
      <div className="about-cta"><span>Vuoi costruire qualcosa con noi?</span><Link href="/servizi">Scopri SIAMO Studio ↗</Link></div>
    </article>
  );
}
