# Bug trovati e corretti — mobile e desktop

Data: 7 settembre 2026 · Base: `main` al commit `81d2c56`.

Il dominio `siamo-un-sito.vercel.app` non è raggiungibile dall'ambiente di analisi
(la policy di rete rifiuta la CONNECT con 403), quindi il sito è stato eseguito
in locale dallo stesso codice, sulla **build di produzione** (`npm run build` +
`vinext start`), che è ciò che Vercel serve. Ispezione con Chromium su
320, 360, 390, 414, 620, 768, 900, 1024, 1180, 1440 e 1920 px di larghezza, in
portrait e landscape, con e senza `prefers-reduced-motion`.

## Sommario

| # | Bug | Dove | Gravità |
| --- | --- | --- | --- |
| 1 | Il titolo delle pagine servizio esce dalla pagina e viene tagliato | `/servizi/[slug]`, da 320 a 1180 px (e oltre il contenitore a 1440/1920) | Alta |
| 2 | I titoli delle card servizi si spezzano a metà parola | `/servizi`, 320–620 e 1024–1920 px | Media |
| 3 | Stesso problema sulle card servizi in home | `/`, 320 px e 1440–1920 px | Media |
| 4 | Favicon, `robots.txt` e `sitemap.xml` puntano a `http://localhost:3000` | ogni pagina, in produzione | Alta |

Nessun errore JavaScript, nessun link interno rotto (16 pagine + 5 redirect
verificati), nessuno scroll orizzontale residuo, CLS invariato.

## 1 · Il titolo delle pagine servizio esce dalla pagina

`.service-detail-hero h1` era dimensionato con `clamp(74px, 16vw, 190px)` e, sotto
i 620 px, con un `65px` fisso. Nessuno dei tre valori guarda la larghezza del
contenitore (`.shell`), quindi una parola lunga non ci stava:

| Viewport | Titolo | Serve | Disponibile | Overflow di pagina |
| --- | --- | --- | --- | --- |
| 320 px | MASTERCLASS | 430 px | 292 px | +124 px |
| 390 px | PARTNERSHIP | 402 px | 362 px | +27 px |
| 768 px | MASTERCLASS | 814 px | 740 px | +60 px |
| 1180 px | MASTERCLASS | 1250 px | 1140 px | +90 px |
| 1440 px | MASTERCLASS | 1258 px | 1180 px | esce dalla griglia |

Poiché `body` ha `overflow-x: clip`, l'eccedenza non produceva una barra di
scorrimento ma veniva tagliata in silenzio: su iPhone la pagina Partnership
mostrava «PARTNERSHI». Tre servizi su sei erano colpiti.

**Correzione.** L'hero diventa un container query (`container-type: inline-size`)
e la dimensione riceve un tetto calcolato sulla parola più lunga del titolo:

```css
font-size: min(clamp(74px, 16vw, 190px), calc(100cqi / (var(--title-chars) * 0.66)));
```

`--title-chars` è impostata dal server (`longestWordLength` in `lib/format.ts`):
un titolo può andare a capo *tra* le parole, mai dentro una parola, quindi è la
parola più lunga a decidere la dimensione massima. `0.66` è l'avanzamento per
carattere più largo del taglio Bold misurato su titoli realistici (il valore reale
di «MASTERCLASS» è 0.60), quindi resta un margine del 9 %. Il `min()` fa sì che i
titoli corti mantengano la dimensione di progetto: «EVENTI» resta a 190 px su
desktop e a 65 px su telefono, solo i nomi lunghi si riducono. Un
`overflow-wrap: anywhere` fa da ultima rete se un titolo dal CMS supera anche la
stima.

## 2 e 3 · Titoli delle card spezzati a metà parola

`.service-card h2` usava `clamp(40px, 15cqi, 84px)`. `15cqi` è appena sopra il
`14.75cqi` che «MASTERCLASS» richiede, così su desktop la card mostrava
«MASTERCLAS / S», con una S sola sulla seconda riga; e il minimo fisso di 40 px
non scendeva mai, quindi a 320 px anche «PARTNERSHIP» e «SERIGRAFIA» si
spezzavano. `.home-service-card h3` aveva lo stesso difetto con `clamp(31px,
3.1vw, 44px)`: dimensionata in `vw` mentre la card è prima una cella di griglia e
poi un elemento di una rail orizzontale.

**Correzione.** Stesso tetto del punto 1 su entrambe le card (la card servizi era
già un container; alla card della home è stato aggiunto `container-type:
inline-size`, e il suo tetto sottrae i 36 px di margine destro riservati alla
freccia). Verificate 48 combinazioni card × viewport: nessuna va più a capo.

## 4 · Favicon, robots e sitemap puntavano a localhost

`metadataBase` ripiegava su `http://localhost:3000` quando `SITE_URL` non era
impostata. In produzione questo significava:

```html
<link rel="icon" href="http://localhost:3000/icon.png?71f68599d70ebb78" sizes="512x512">
```

su **ogni** pagina — una richiesta fallita per ogni visita e nessuna favicon —
più un `robots.txt` che dichiarava `Sitemap: http://localhost:3000/sitemap.xml` e
una `sitemap.xml` con tutti i `<loc>` su localhost, che Google scarta.

**Correzione.** Due interventi indipendenti:

- `lib/site-url.ts` centralizza l'origine pubblica. `SITE_URL` resta prioritaria;
  senza di essa vengono usate le variabili che Vercel espone da sé
  (`VERCEL_PROJECT_PRODUCTION_URL`, poi `VERCEL_URL`) e solo in ultimo il default
  locale. `robots.ts`, `sitemap.ts` e `metadataBase` leggono da qui.
- La favicon non passa più dai metadati. `app/icon.png` (convenzione di file, che
  Next risolve contro `metadataBase`) è diventata `public/icon.png`, collegata con
  un `<link rel="icon" href="/icon.png">` relativo alla radice: corretto su
  qualunque host serva la pagina, anche sui deploy di preview, che hanno un
  dominio diverso da quello di produzione.

## Cosa è stato verificato e non è un bug

- **Wordmark 3D.** Su telefono viene rasterizzato a densità 1.25× (il profilo
  leggero introdotto in `c9614f6`) e a 30 fps: appare più morbido della versione
  statica su schermi 3×. È un compromesso di prestazioni deliberato, non un
  difetto, e non è stato toccato.
- **Feed a schermate della home mobile.** `scroll-snap-type: y mandatory` con una
  sezione per swipe è una scelta di progetto già discussa e mantenuta in
  `docs/analisi-ui-ux.md`.
- **Righe della timeline «sbiadite».** Compaiono solo negli screenshot a pagina
  intera, che alterano le animazioni `animation-timeline: view()`. Scorrendo
  davvero, tutte le otto righe arrivano a opacità 1 e tutte le immagini caricano.
- **Card Instagram e testi `sr-only`.** Le prime misure segnalavano tagli che
  erano l'etichetta «(si apre in una nuova scheda)» conteggiata insieme al testo
  visibile.

## Come riprodurre

```bash
npm run install:ci
npm run build
npx vinext start --port 3100
```

Poi aprire `/servizi/masterclass` a 390 px e a 1440 px, e controllare
`/robots.txt`, `/sitemap.xml` e il `<link rel="icon">` nella home. I test
`npm test` coprono i quattro punti.
