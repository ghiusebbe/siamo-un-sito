import Link from "next/link";
import { StudioClient } from "@/components/studio-client";
import { sanityConfigured, sanityDataset, sanityProjectId } from "@/lib/sanity";

export const dynamic = "force-dynamic";

export default function StudioPage() {
  if (!sanityConfigured) {
    return (
      <main style={{ minHeight: "100vh", background: "#080808", color: "white", padding: "8vw", fontFamily: "Arial, sans-serif" }}>
        <p style={{ color: "#45ff16", textTransform: "uppercase", letterSpacing: ".12em", fontSize: 12 }}>SIAMO Studio</p>
        <h1 style={{ fontSize: "clamp(56px, 12vw, 150px)", lineHeight: .82, letterSpacing: "-.08em", margin: "30px 0" }}>COLLEGA<br />IL CMS.</h1>
        <p style={{ maxWidth: 620, color: "#b9b9b4", fontSize: 20 }}>
          Il sito sta usando i contenuti migrati inclusi nel progetto. Inserisci SANITY_PROJECT_ID nelle variabili d’ambiente e questa pagina diventerà il pannello editoriale completo.
        </p>
        {/* The site chrome steps aside on /studio, so this screen carries its own way back. */}
        <Link href="/" style={{ display: "inline-block", marginTop: 40, color: "#45ff16", fontSize: 18, textDecoration: "underline" }}>
          Torna al sito
        </Link>
      </main>
    );
  }

  return <StudioClient projectId={sanityProjectId} dataset={sanityDataset} />;
}
