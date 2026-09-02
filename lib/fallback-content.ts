import type {
  Article,
  EventItem,
  Magazine,
  Service,
  SiteSettings,
  TimelineItem,
} from "@/types/content";

export const fallbackSettings: SiteSettings = {
  title: "SIAMO",
  description:
    "Progetto editoriale indipendente dedicato alla musica e alla cultura emergente italiana.",
  email: "siamounmagazine@gmail.com",
  instagramHandle: "@siamounmagazine",
  instagramUrl: "https://www.instagram.com/siamounmagazine/",
  metrics: [
    { value: "1200+", label: "Articoli" },
    { value: "50+", label: "Eventi" },
    { value: "20K", label: "Followers" },
  ],
};

export const fallbackMagazines: Magazine[] = [
  {
    id: "volume-1",
    volume: 1,
    title: "SIAMO Cartaceo — Volume 1",
    cover: "/media/volume-1.png",
    checkoutUrl:
      "https://siamo.lemonsqueezy.com/checkout/buy/3c06dd53-53ac-4034-af67-8961cf2f48d4",
  },
  {
    id: "volume-2",
    volume: 2,
    title: "SIAMO Cartaceo — Volume 2",
    cover: "/media/volume-2.png",
    checkoutUrl:
      "https://siamo.lemonsqueezy.com/checkout/buy/062c8a4d-e020-49fb-b09d-6a83da586676",
  },
  {
    id: "volume-3",
    volume: 3,
    title: "SIAMO Cartaceo — Volume 3",
    cover: "/media/volume-3.png",
    checkoutUrl:
      "https://siamo.lemonsqueezy.com/checkout/buy/0da0e8ce-95b3-428e-8d14-3c9126cc3e9e",
  },
];

export const fallbackArticles: Article[] = [
  {
    id: "article-format",
    title: "Titolo format in generale",
    slug: "titolo-format-2026",
    category: "News della settimana",
    subtitle: "Titolo format dettagliato",
    excerpt:
      "Contenuto importato dal CMS Framer e pronto per essere completato nel nuovo pannello editoriale.",
    body: [
      "Questo articolo proviene dalla versione precedente del sito. Il testo originale era ancora un segnaposto: ora può essere sostituito e impaginato dal pannello SIAMO Studio.",
      "Il nuovo modello editoriale supporta titolo, sottotitolo, autore, categoria, copertina, data di pubblicazione e contenuto strutturato.",
    ],
    cover: "/media/article-format.jpg",
    author: "SIAMO",
    publishedAt: "2026-08-15T10:00:00.000Z",
    featured: true,
  },
  {
    id: "article-news-2",
    title: "News della settimana",
    slug: "news-della-settimana-2",
    category: "News della settimana",
    subtitle: "News #2",
    excerpt: "Secondo contenuto editoriale recuperato dal sito precedente.",
    body: ["Ciao, qua c’è il testo delle news della settimana."],
    cover: "/media/article-news.png",
    author: "Ismael Samu",
    publishedAt: "2026-08-08T10:00:00.000Z",
  },
];

export const fallbackEvents: EventItem[] = [
  {
    id: "event-ancora-kasino",
    title: "Ancora + Kasino",
    slug: "ancora-kasino",
    date: "2026-05-02T21:00:00.000Z",
    lineup: ["Dante", "Kuzu", "Jack Raw", "Terrona Music", "Sir Prodige"],
    description: [
      "Evento importato dall’archivio SIAMO. Dal nuovo CMS puoi aggiungere luogo, città, descrizione, biglietti, lineup e stato dell’evento.",
    ],
    cover: "/media/event-ancora-kasino.jpg",
    status: "archived",
  },
];

export const fallbackTimeline: TimelineItem[] = [
  { id: "tl-2026-orto-2", year: 2026, title: "ORTO Vol. 2", image: "/media/service-identity.jpg" },
  { id: "tl-2026-cartaceo-3", year: 2026, title: "Il terzo cartaceo", image: "/media/volume-3.png" },
  { id: "tl-2025-orto-1", year: 2025, title: "ORTO Vol. 1", image: "/media/home-magazine.jpg" },
  { id: "tl-2025-tour", year: 2025, title: "SIAMO in tour", image: "/media/community.webp" },
  { id: "tl-2024-dr-martens", year: 2024, title: "Arte Grezza × Dr. Martens", image: "/media/service-identity-2.jpg" },
  { id: "tl-2024-cartaceo-2", year: 2024, title: "Il secondo cartaceo", image: "/media/volume-2.png" },
  { id: "tl-2024-tour", year: 2024, title: "SIAMO in tour", image: "/media/service-identity-3.jpg" },
  { id: "tl-2023-cartaceo-1", year: 2023, title: "Il primo cartaceo", image: "/media/volume-1.png" },
];

export const fallbackServices: Service[] = [
  {
    id: "service-partnership",
    title: "Partnership",
    slug: "partnership",
    tagline: "Progetti condivisi, senza perdere identità.",
    intro:
      "Costruiamo collaborazioni tra brand, artisti, etichette e comunità culturali, trasformando obiettivi comuni in format credibili.",
    cover: "/media/community.webp",
    gallery: ["/media/instagram/tipule-collab.jpg"],
    deliverables: [
      { title: "Creative partnership", description: "Concept e attivazioni coerenti con entrambe le identità." },
      { title: "Media partnership", description: "Copertura editoriale e distribuzione attraverso i canali SIAMO." },
      { title: "Community activation", description: "Esperienze capaci di coinvolgere pubblico e scena locale." },
    ],
    faq: [],
  },
  {
    id: "service-eventi",
    title: "Eventi",
    slug: "eventi",
    tagline: "Dall’idea all’ultima cassa spenta.",
    intro:
      "Ideiamo e produciamo eventi culturali e musicali, curando direzione artistica, comunicazione, allestimento e contenuti.",
    cover: "/media/home-poster.webp",
    gallery: ["/media/instagram/festival-recap.jpg"],
    deliverables: [
      { title: "Format & direzione artistica", description: "Concept, programma, artisti e tono dell’esperienza." },
      { title: "Produzione", description: "Coordinamento operativo, fornitori e flussi della giornata." },
      { title: "Comunicazione", description: "Campagna visiva, piano editoriale e racconto post-evento." },
    ],
    faq: [],
  },
  {
    id: "service-identity",
    title: "Identity",
    slug: "identity",
    tagline: "Visual identity con un’anima.",
    intro:
      "Un’estetica pulita non basta: serve attitudine. Disegniamo l’identità visiva per brand, festival, release discografiche, etichette ed eventi, costruendo immaginari forti e coerenti con la cultura di riferimento.",
    cover: "/media/service-identity.jpg",
    gallery: ["/media/instagram/magazine-third-issue.jpg", "/media/service-identity-2.jpg", "/media/service-identity-3.jpg"],
    deliverables: [
      { title: "Brand Strategy & Visual System", description: "Loghi, palette, typography e linee guida visive complete." },
      { title: "Art Direction & Cover Art", description: "Direzione artistica per release, copertine, poster e materiali promozionali." },
      { title: "Merchandise & Apparel Design", description: "Grafiche per abbigliamento, accessori ed edizioni limitate." },
    ],
    faq: [
      { question: "Qual è il vostro processo di progettazione grafica?", answer: "Partiamo da ascolto e ricerca visiva, definiamo concept e attitudine, quindi sviluppiamo logo, tipografia, colori e applicazioni fino ai file finali." },
      { question: "Progettate anche grafica per merchandising o musica?", answer: "Sì. Realizziamo artwork, copertine, poster e grafiche pronte per la stampa su abbigliamento e accessori." },
      { question: "Cosa include la consegna?", answer: "Linee guida, loghi nei formati necessari, font e mock-up applicati ai materiali di riferimento." },
    ],
  },
  {
    id: "service-content",
    title: "Content",
    slug: "content",
    tagline: "Storie da raccontare, linguaggi da dominare.",
    intro:
      "Produciamo contenuti visivi ed editoriali che parlano la lingua di oggi. Dalla fotografia ai format video e documentari, raccontiamo scene, retroscena artistici e progetti culturali.",
    cover: "/media/service-content.jpeg",
    gallery: ["/media/instagram/hypersimposio-selton.jpg", "/media/service-content-2.jpg"],
    deliverables: [
      { title: "Photo & Video Production", description: "Shooting, recap, aftermovie per eventi e videoclip." },
      { title: "Editorial & Copywriting", description: "Interviste, approfondimenti, recensioni e storytelling." },
      { title: "Social Content", description: "Asset dinamici e formati brevi per Reels e TikTok." },
    ],
    faq: [
      { question: "Di cosa avete bisogno prima di iniziare?", answer: "Di un brief con obiettivi, target e referenze. Da lì sviluppiamo script, moodboard, scaletta e piano di distribuzione." },
      { question: "Vi occupate anche di post-produzione?", answer: "Sì: montaggio, color grading, sound design e adattamento ai diversi formati digitali." },
      { question: "I contenuti restano di proprietà del cliente?", answer: "Una volta completato e saldato il progetto, i diritti sui contenuti finali vengono trasferiti al cliente." },
    ],
  },
  {
    id: "service-serigrafia",
    title: "Serigrafia",
    slug: "serigrafia",
    tagline: "Live screen printing & produzioni artigianali.",
    intro:
      "La stampa serigrafica è il nostro punto d’incontro tra artigianato e performance. Portiamo laboratori live in festival ed eventi e produciamo merchandising, poster e stampe d’arte.",
    cover: "/media/service-serigrafia.jpg",
    deliverables: [
      { title: "Live Screen Printing", description: "Stampa dal vivo su maglie, tote bag e poster durante eventi e festival." },
      { title: "Custom Merch & Apparel", description: "Produzione serigrafica su capi personalizzati con finiture speciali." },
      { title: "Fine Art Poster", description: "Tirature limitate e numerate su carte ad alta grammatura." },
    ],
    faq: [
      { question: "Come funziona il servizio live?", answer: "Portiamo una postazione mobile e stampiamo in tempo reale davanti al pubblico, trasformando la produzione in una performance." },
      { question: "Fornite anche i capi?", answer: "Possiamo fornire capi e articoli promozionali oppure stampare direttamente sui materiali del cliente." },
      { question: "Esiste un quantitativo minimo?", answer: "Per ottimizzare i costi consigliamo una tiratura minima, ma valutiamo anche piccole edizioni speciali." },
    ],
  },
  {
    id: "service-masterclass",
    title: "Masterclass",
    slug: "masterclass",
    tagline: "Conoscenza pratica, condivisa dalla scena.",
    intro:
      "Workshop e incontri con professionisti per trasformare esperienze reali in strumenti utili a chi lavora nella musica, nell’arte e nella comunicazione.",
    cover: "/media/article-format.jpg",
    gallery: ["/media/stock-masterclass.webp"],
    deliverables: [
      { title: "Workshop", description: "Sessioni operative su comunicazione, immagine e produzione culturale." },
      { title: "Talk", description: "Conversazioni pubbliche con artisti e professionisti." },
      { title: "Percorsi su misura", description: "Programmi costruiti per scuole, festival e organizzazioni." },
    ],
    faq: [],
  },
];
