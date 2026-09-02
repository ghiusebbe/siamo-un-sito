"use client";

import { NextStudio } from "next-sanity/studio";
import config from "@/sanity.config";

export default function StudioPage() {
  const configured = Boolean(process.env.NEXT_PUBLIC_SANITY_PROJECT_ID);

  if (!configured) {
    return (
      <main style={{ minHeight: "100vh", background: "#080808", color: "white", padding: "8vw", fontFamily: "Arial, sans-serif" }}>
        <p style={{ color: "#45ff16", textTransform: "uppercase", letterSpacing: ".12em", fontSize: 12 }}>SIAMO Studio</p>
        <h1 style={{ fontSize: "clamp(56px, 12vw, 150px)", lineHeight: .82, letterSpacing: "-.08em", margin: "30px 0" }}>COLLEGA<br />IL CMS.</h1>
        <p style={{ maxWidth: 620, color: "#b9b9b4", fontSize: 20 }}>
          Il sito sta usando i contenuti migrati inclusi nel progetto. Inserisci il Project ID Sanity nelle variabili d’ambiente e questa pagina diventerà il pannello editoriale completo.
        </p>
      </main>
    );
  }

  return <NextStudio config={config} />;
}
