import { createClient } from "@sanity/client";
import { createReadStream } from "node:fs";
import { extname, resolve } from "node:path";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const token = process.env.SANITY_API_WRITE_TOKEN;

if (!projectId || !token) {
  throw new Error("Inserisci NEXT_PUBLIC_SANITY_PROJECT_ID e SANITY_API_WRITE_TOKEN in .env.local");
}

const client = createClient({ projectId, dataset, token, apiVersion: "2026-08-01", useCdn: false });
const mediaDir = resolve(process.cwd(), "public/media");

const imageFiles = {
  volume1: "volume-1.png", volume2: "volume-2.png", volume3: "volume-3.png",
  articleFormat: "article-format.jpg", articleNews: "article-news.png",
  event: "event-ancora-kasino.jpg", community: "community.webp", homePoster: "home-poster.webp",
  homeMagazine: "home-magazine.jpg", identity: "service-identity.jpg",
  identity2: "service-identity-2.jpg", identity3: "service-identity-3.jpg",
  content: "service-content.jpeg", content2: "service-content-2.jpg",
  serigrafia: "service-serigrafia.jpg",
  instagramMagazine: "instagram/magazine-third-issue.jpg",
  instagramTipule: "instagram/tipule-collab.jpg",
  instagramHypersimposio: "instagram/hypersimposio-selton.jpg",
  instagramFestival: "instagram/festival-recap.jpg",
};

const assets = {};
for (const [key, filename] of Object.entries(imageFiles)) {
  const filePath = resolve(mediaDir, filename);
  const asset = await client.assets.upload("image", createReadStream(filePath), {
    filename,
    contentType: extname(filename) === ".png" ? "image/png" : extname(filename) === ".webp" ? "image/webp" : "image/jpeg",
  });
  assets[key] = { _type: "image", asset: { _type: "reference", _ref: asset._id } };
  console.log(`✓ ${filename}`);
}

const block = (text, index = 0) => ({
  _key: `block-${index}`,
  _type: "block",
  style: "normal",
  markDefs: [],
  children: [{ _key: `span-${index}`, _type: "span", marks: [], text }],
});
const slug = (current) => ({ _type: "slug", current });
const keyed = (items, prefix) => items.map((item, index) => ({ _key: `${prefix}-${index}`, ...item }));

const services = [
  {
    _id: "service-partnership", title: "Partnership", slug: "partnership", order: 1,
    tagline: "Progetti condivisi, senza perdere identità.",
    intro: "Costruiamo collaborazioni tra brand, artisti, etichette e comunità culturali, trasformando obiettivi comuni in format credibili.",
    coverImage: assets.community, gallery: [assets.instagramTipule],
    deliverables: [
      { title: "Creative partnership", description: "Concept e attivazioni coerenti con entrambe le identità." },
      { title: "Media partnership", description: "Copertura editoriale e distribuzione attraverso i canali SIAMO." },
      { title: "Community activation", description: "Esperienze capaci di coinvolgere pubblico e scena locale." },
    ], faq: [],
  },
  {
    _id: "service-eventi", title: "Eventi", slug: "eventi", order: 2,
    tagline: "Dall’idea all’ultima cassa spenta.",
    intro: "Ideiamo e produciamo eventi culturali e musicali, curando direzione artistica, comunicazione, allestimento e contenuti.",
    coverImage: assets.homePoster, gallery: [assets.instagramFestival],
    deliverables: [
      { title: "Format & direzione artistica", description: "Concept, programma, artisti e tono dell’esperienza." },
      { title: "Produzione", description: "Coordinamento operativo, fornitori e flussi della giornata." },
      { title: "Comunicazione", description: "Campagna visiva, piano editoriale e racconto post-evento." },
    ], faq: [],
  },
  {
    _id: "service-identity", title: "Identity", slug: "identity", order: 3,
    tagline: "Visual identity con un’anima.",
    intro: "Un’estetica pulita non basta: serve attitudine. Disegniamo l’identità visiva per brand, festival, release discografiche, etichette ed eventi.",
    coverImage: assets.identity, gallery: [assets.instagramMagazine, assets.identity2, assets.identity3],
    deliverables: [
      { title: "Brand Strategy & Visual System", description: "Loghi, palette, typography e linee guida complete." },
      { title: "Art Direction & Cover Art", description: "Direzione artistica per release, copertine, poster e materiali promozionali." },
      { title: "Merchandise & Apparel Design", description: "Grafiche per abbigliamento, accessori ed edizioni limitate." },
    ],
    faq: [
      { question: "Qual è il vostro processo?", answer: "Partiamo da ascolto e ricerca visiva, definiamo il concept e sviluppiamo il sistema fino ai file finali." },
      { question: "Progettate anche merchandising o artwork?", answer: "Sì: copertine, poster e grafiche pronte per la stampa." },
    ],
  },
  {
    _id: "service-content", title: "Content", slug: "content", order: 4,
    tagline: "Storie da raccontare, linguaggi da dominare.",
    intro: "Produciamo contenuti visivi ed editoriali che parlano la lingua di oggi, dalla fotografia ai format video e documentari.",
    coverImage: assets.content, gallery: [assets.instagramHypersimposio, assets.content2],
    deliverables: [
      { title: "Photo & Video Production", description: "Shooting, recap, aftermovie e videoclip." },
      { title: "Editorial & Copywriting", description: "Interviste, approfondimenti, recensioni e storytelling." },
      { title: "Social Content", description: "Asset dinamici e formati brevi per Reels e TikTok." },
    ],
    faq: [{ question: "Vi occupate di post-produzione?", answer: "Sì: montaggio, color grading, sound design e adattamento ai diversi formati." }],
  },
  {
    _id: "service-serigrafia", title: "Serigrafia", slug: "serigrafia", order: 5,
    tagline: "Live screen printing & produzioni artigianali.",
    intro: "Portiamo laboratori di stampa live in festival ed eventi e produciamo merchandising, poster e stampe d’arte.",
    coverImage: assets.serigrafia,
    deliverables: [
      { title: "Live Screen Printing", description: "Stampa dal vivo su maglie, tote bag e poster." },
      { title: "Custom Merch & Apparel", description: "Produzione serigrafica con finiture speciali." },
      { title: "Fine Art Poster", description: "Tirature limitate e numerate." },
    ], faq: [],
  },
  {
    _id: "service-masterclass", title: "Masterclass", slug: "masterclass", order: 6,
    tagline: "Conoscenza pratica, condivisa dalla scena.",
    intro: "Workshop e incontri con professionisti per trasformare esperienze reali in strumenti utili a chi lavora nella cultura.",
    coverImage: assets.articleFormat,
    deliverables: [
      { title: "Workshop", description: "Sessioni operative su comunicazione, immagine e produzione culturale." },
      { title: "Talk", description: "Conversazioni pubbliche con artisti e professionisti." },
      { title: "Percorsi su misura", description: "Programmi per scuole, festival e organizzazioni." },
    ], faq: [],
  },
];

const documents = [
  {
    _id: "site-settings", _type: "siteSettings", title: "SIAMO",
    description: "Progetto editoriale indipendente dedicato alla musica e alla cultura emergente italiana.",
    email: "siamounmagazine@gmail.com", instagramHandle: "@siamounmagazine",
    instagramUrl: "https://www.instagram.com/siamounmagazine/",
    // Add real figures from Studio when you have them: the home shows the block only if present.
    metrics: [],
  },
  ...[
    [1, assets.volume1, "3c06dd53-53ac-4034-af67-8961cf2f48d4"],
    [2, assets.volume2, "062c8a4d-e020-49fb-b09d-6a83da586676"],
    [3, assets.volume3, "0da0e8ce-95b3-428e-8d14-3c9126cc3e9e"],
  ].map(([volume, coverImage, checkout]) => ({
    _id: `magazine-${volume}`, _type: "magazine", volume, title: `SIAMO Cartaceo — Volume ${volume}`,
    coverImage, checkoutUrl: `https://siamo.lemonsqueezy.com/checkout/buy/${checkout}`,
  })),
  {
    _id: "article-format", _type: "article", title: "Titolo format in generale", slug: slug("titolo-format-2026"),
    category: "News della settimana", subtitle: "Titolo format dettagliato",
    excerpt: "Contenuto importato dal CMS Framer e pronto per essere completato.", author: "SIAMO",
    publishedAt: "2026-08-15T10:00:00.000Z", featured: true, coverImage: assets.articleFormat,
    body: [block("Questo articolo proviene dalla versione precedente del sito e ora può essere completato dal pannello SIAMO Studio.")],
  },
  {
    _id: "article-news-2", _type: "article", title: "News della settimana", slug: slug("news-della-settimana-2"),
    category: "News della settimana", subtitle: "News #2", excerpt: "Secondo contenuto editoriale recuperato dal sito precedente.",
    author: "Ismael Samu", publishedAt: "2026-08-08T10:00:00.000Z", coverImage: assets.articleNews,
    body: [block("Ciao, qua c’è il testo delle news della settimana.")],
  },
  {
    _id: "event-ancora-kasino", _type: "event", title: "Ancora + Kasino", slug: slug("ancora-kasino"),
    date: "2026-05-02T21:00:00.000Z", lineup: ["Dante", "Kuzu", "Jack Raw", "Terrona Music", "Sir Prodige"],
    description: [block("Evento importato dall’archivio SIAMO.")], coverImage: assets.event, status: "archived",
  },
  ...services.map((service) => ({
    ...service, _type: "service", slug: slug(service.slug),
    deliverables: keyed(service.deliverables, `${service._id}-deliverable`),
    faq: keyed(service.faq, `${service._id}-faq`),
    gallery: service.gallery?.map((image, index) => ({ ...image, _key: `${service._id}-gallery-${index}` })),
  })),
  ...[
    ["tl-2026-orto-2", 2026, 1, "ORTO Vol. 2", assets.identity],
    ["tl-2026-cartaceo-3", 2026, 2, "Il terzo cartaceo", assets.volume3],
    ["tl-2025-orto-1", 2025, 1, "ORTO Vol. 1", assets.homeMagazine],
    ["tl-2025-tour", 2025, 2, "SIAMO in tour", assets.community],
    ["tl-2024-dr-martens", 2024, 1, "Arte Grezza × Dr. Martens", assets.identity2],
    ["tl-2024-cartaceo-2", 2024, 2, "Il secondo cartaceo", assets.volume2],
    ["tl-2024-tour", 2024, 3, "SIAMO in tour", assets.identity3],
    ["tl-2023-cartaceo-1", 2023, 1, "Il primo cartaceo", assets.volume1],
  ].map(([id, year, order, title, image]) => ({ _id: id, _type: "timelineItem", year, order, title, image })),
];

for (const document of documents) {
  await client.createOrReplace(document);
  console.log(`✓ ${document._type}: ${document.title || document._id}`);
}

console.log(`\nImportazione completata: ${documents.length} documenti.`);
