# Analisi UI/UX e frontend — SIAMO (un sito)

Data: 3 settembre 2026 · Base analizzata: branch `main` al commit `cf7c0e4` (identico a `claude/ui-ux-frontend-analysis-gmgwrr`).

Il dominio `siamo-un-sito.vercel.app` non è raggiungibile dall'ambiente di analisi (proxy di rete), quindi il sito è stato eseguito in locale dallo stesso codice: dev server Vite per gli screenshot, `vite build` + `vite preview` per peso pagina, LCP e CLS. Viewport testate: 1440×900, 820×1180, 390×844 (portrait), 844×390 (landscape). Le pagine sono state renderizzate con i contenuti di fallback inclusi nel repo, cioè quelli che vede anche il pubblico finché Sanity non è collegato.

## Sommario

Il sito ha un'identità visiva forte e coerente (nero, acid green, Helvetica bold, titoli enormi, griglia bento) e una base tecnica solida: React Server Components, CLS pari a zero, header e menu mobile accessibili, skip link, focus visibile, rispetto di `prefers-reduced-motion`. TypeScript ed ESLint passano puliti.

I problemi principali non sono di gusto ma di finitura: un font corrotto che silenziosamente sostituisce il corsivo con Arial, una 404 nuda, la home senza `h1`, contenuti segnaposto in produzione, immagini non ottimizzate e un feed mobile a scroll obbligato che combatte con l'utente.

| Priorità | Numero | Cosa |
| --- | --- | --- |
| P1 · Critico | 5 | Font Oblique rotto, 404 non brandizzata, home senza h1, placeholder in produzione, feed mobile a snap obbligatorio |
| P2 · Importante | 10 | Immagini pesanti, font TTF, titoli tagliati, contrasti, newsletter senza consenso, timeline inerte, ridondanza home… |
| P3 · Miglioramento | 7 | Pagine di dettaglio scarne, footer minimo, CSS stratificato, test assenti… |

## Cosa funziona bene

- **Identità.** Il wordmark a tutta larghezza, la palette a tre colori e la Helvetica bold con tracking negativo danno una voce riconoscibile. Le card bento in home sono un buon menù visivo.
- **Header.** Sticky, con pill di navigazione, stato attivo (`aria-current="page"`), barra di avanzamento di lettura e riduzione in altezza allo scroll. Ordine di tabulazione corretto: skip link → brand → nav → card.
- **Menu mobile.** `aria-expanded`, `aria-controls`, chiusura con Esc e al passaggio a desktop, blocco dello scroll del body. Voci grandi e facilmente toccabili.
- **Accessibilità di base.** `lang="it"`, skip link, `:focus-visible` in acid green, `sr-only` per la label del form, `prefers-reduced-motion` che spegne animazioni e caret.
- **Stabilità.** Tutte le immagini hanno `width`/`height`: CLS misurato 0.000 su desktop e mobile. LCP in locale ≈1.0 s su desktop (wordmark) e ≈0.2 s su mobile.
- **Contrasti.** I testi principali superano abbondantemente AA (eyebrow 7.2:1, acid su nero 14.9:1).
- **Dettaglio evento.** Layout a due colonne con testo sticky e locandina verticale: la pagina più riuscita del sito.

## P1 · Problemi critici

### 1. Il font Helvetica Oblique è corrotto: il corsivo è renderizzato in Arial

Console del browser su ogni pagina:

```
Failed to decode downloaded font: /fonts/Helvetica-Oblique.ttf
OTS parsing error: glyf: Glyph 384 length 306 too high
```

Verifica con Chrome DevTools Protocol (`CSS.getPlatformFontsForNode`):

| Elemento | Font effettivamente usato |
| --- | --- |
| `.home-intro-copy` (claim hero) | Liberation Sans (sistema) |
| `.home-intro-index`, `.eyebrow`, `small` delle card | Liberation Sans (sistema) |
| `.latest-card p`, `.desktop-nav a` | Helvetica (webfont) |

Tutto ciò che il CSS mette in `font-style: oblique` (claim della home, eyebrow, kicker, sottotitoli articolo, tagline servizi, numeri di riga, etichette) cade sul fallback di sistema: Liberation Sans su Linux, Arial su Windows, Helvetica Neue su macOS, Roboto su Android. Il sito mostra quindi due famiglie diverse mescolate, e cambia aspetto in base al sistema operativo. Nessun test lo intercetta perché `font-display: swap` fallisce in silenzio.

Fix: rigenerare il file (ad esempio con `fonttools` o FontForge) o rimuovere la terza `@font-face` e ottenere l'obliquo con `font-synthesis: style` a partire dal Regular. In entrambi i casi convertire i tre file in WOFF2 (vedi P2.6). Verificare anche la licenza: il file Oblique riporta copyright Hewlett-Packard 1992-97 ed è un font commerciale.

### 2. La pagina 404 è un "Not Found" in testo nudo

`app/not-found.tsx` non esiste. Un URL sbagliato (o un vecchio link Framer non coperto dai redirect) restituisce una pagina bianca con la scritta "Not Found", senza header, footer, font o navigazione. Manca anche `app/error.tsx` per gli errori runtime.

Fix: creare `not-found.tsx` con il layout del sito, un titolo tipografico nello stile delle pagine hero e link alle sezioni principali.

### 3. La home non ha un `h1`

Il wordmark è un'immagine con `alt=""` dentro un `div` con `aria-label`. Per screen reader e motori di ricerca la home non ha titolo: il primo heading è "Ultime storie" (`h2`). Il template dei metadati è corretto, ma nel DOM manca il livello 1.

Fix: `alt="SIAMO"` sull'immagine e un `h1` visivamente nascosto (o rendere il wordmark stesso un `h1` con l'immagine dentro).

### 4. Contenuti segnaposto visibili in produzione

Con Sanity non configurato il sito serve i fallback, che contengono testi di lavoro:

- Card "In evidenza" della home e primo articolo: **"Titolo format in generale"**, sottotitolo "Titolo format dettagliato", corpo "Questo articolo proviene dalla versione precedente del sito. Il testo originale era ancora un segnaposto…".
- Secondo articolo: "Ciao, qua c'è il testo delle news della settimana."
- Dettaglio evento: "Evento importato dall'archivio SIAMO. Dal nuovo CMS puoi aggiungere luogo, città…".
- Metriche: **1200+ articoli** e **50+ eventi** con 2 articoli e 1 evento pubblicati. Il numero contraddice la pagina e mina la credibilità.

Lo stesso evento "Ancora + Kasino" compare quattro volte in home (bento, ultime storie, promo evento, latest strip) perché è l'unico contenuto disponibile.

Fix: pubblicare contenuti reali o, finché non ci sono, rendere condizionali le sezioni (nascondere "Ultime storie" sotto tre articoli, la promo evento se già in bento) e togliere le metriche non verificabili.

### 5. Feed mobile a scroll-snap obbligatorio

Su telefono in portrait (`max-width: 767px and (orientation: portrait)`) la home diventa un feed a schermate: `scroll-snap-type: y mandatory`, `scroll-snap-stop: always`, `overscroll-behavior-y: none`, ogni sezione forzata a `100dvh - header` con `overflow: hidden`. Effetti osservati a 390×844:

- **Doppio asse di scroll.** Ogni schermata contiene una rail orizzontale (card articoli, feed IG, volumi, servizi, story). L'utente scorre in verticale tra sezioni e in orizzontale dentro ciascuna; sfiorare in diagonale fa scattare lo snap.
- **Contenuto tagliato.** Le card "Ultime storie" e "Dal feed" vengono clippate in altezza; il titolo dell'articolo e l'excerpt hanno `line-clamp` a 2 righe.
- **Schermate vuote.** Metriche (tre numeri) e footer (email, IG, logo) occupano un'intera schermata ciascuno: due swipe per tre righe di testo.
- **Nessuna via di uscita.** `scroll-snap-stop: always` impedisce di scorrere velocemente verso il footer; `overscroll-behavior: none` disattiva anche il pull-to-refresh del browser.
- **Reduced motion.** Passa a `proximity`, ma l'altezza forzata resta.

Questa scelta è deliberata ("Full-screen vertical home feed") e ha una sua coerenza con Instagram. Il consiglio è comunque di ammorbidirla: `scroll-snap-type: y proximity` senza `scroll-snap-stop`, altezza `min-height` invece di `height`, metriche e newsletter nella stessa schermata, footer fuori dallo snap.

## P2 · Problemi importanti

### 6. Immagini servite alla dimensione originale

`components/site-image.tsx` forza `unoptimized: true` su ogni immagine e `next.config.ts` disattiva l'ottimizzazione globalmente. Il README promette resize automatico e AVIF/WebP, ma non è attivo: tutte le `sizes` dichiarate sono inerti. Il worker espone già `/_vinext/image` con Cloudflare Images, inutilizzato.

Peso misurato sulla build di produzione (byte non compressi):

| Pagina | Totale | Immagini | Voce più pesante |
| --- | --- | --- | --- |
| Home desktop | 2.5 MB | 1.4 MB | `home-poster.webp` 787 KB per una card larga 25vw |
| Home mobile | 1.9 MB | 0.8 MB | `open-days.jpg` 223 KB |
| Timeline | ~1.0 MB | 0.9 MB | quattro JPEG da 220–240 KB per thumbnail di 270 px |

`siamo-illustration.png` (224 KB) viene caricata in home solo come decorazione al 14 % di opacità. Fix: riattivare l'ottimizzazione (togliere `unoptimized`) oppure pre-generare varianti ridotte; caricare le decorazioni con `loading="lazy"`.

### 7. Font TTF non compressi e non preloadati

Tre TTF per 434 KB (non compressi). In WOFF2 con subset latino peserebbero circa un terzo. Nessun `<link rel="preload">` sul Regular e sul Bold, che sono nel percorso critico di ogni titolo.

### 8. Asset inutilizzati nel deploy

`community.jpeg` (4.1 MB), `home-poster.png` (4.2 MB), `stock-events.webp`, `stock-partnership.webp`, `siamo-mark.png` non sono referenziati da nessun file. Sono pubblici e indicizzabili.

### 9. Titoli tagliati nelle card servizi (desktop)

A 1440 px "PARTNERSHIP" e "MASTERCLASS" escono dalla card: `font-size: clamp(48px, 7vw, 84px)` in una card da circa 450 px con `overflow: hidden`. Su mobile la regola `overflow-wrap: anywhere` salva il layout ma spezza la parola. Fix: dimensionare con container query (`cqi`) o abbassare il massimo a ~64 px, e non nascondere l'overflow del testo.

### 10. Card servizi "sbiadite" a riposo

Nella pagina Servizi le immagini stanno al 20 % di opacità in scala di grigi e appaiono solo in hover. A riposo la griglia sembra caricata a metà; su touch l'hover non esiste e infatti il CSS mobile le riporta a opacità piena. La stessa scelta in home (28 %) funziona meglio perché su nero. Fix: opacità 100 % con gradiente scuro, o un solo stato per tutti i dispositivi.

### 11. Contrasti sotto AA sui testi piccoli

| Testo | Rapporto | Soglia AA |
| --- | --- | --- |
| `.section-count` #666661 su nero | 3.47:1 | 4.5:1 |
| `.article-ad__label` #6f6f6b su nero | 3.97:1 | 4.5:1 |
| Numeri del menu mobile #71716d su nero | 4.09:1 | 4.5:1 |
| `.row-number` #777 su bianco | 4.10:1 | 4.5:1 |

Sono tutti testi da 10–12 px, dove serve il massimo rigore. Fix: alzare i grigi a ~#8a8a85 su nero e ~#5c5c58 su bianco.

### 12. Newsletter: form visibile ma non funzionante, senza consenso

Senza `SANITY_API_WRITE_TOKEN` l'API risponde 503 "La newsletter verrà attivata insieme al CMS": l'utente compila, invia e riceve un errore. Manca inoltre qualunque informativa privacy o checkbox di consenso, richiesta in Italia per la raccolta di email. Fix: nascondere la sezione finché l'integrazione non è attiva; aggiungere link all'informativa e consenso esplicito.

### 13. Timeline inerte

Otto righe da 270 px di altezza, tre senza immagine (spazio vuoto), anno ripetuto su più righe, nessun link: la pagina non porta da nessuna parte. Le immagini in scala di grigi con hover a colori non hanno equivalente su touch. Fix: raggruppare per anno, collegare ogni voce a evento/articolo/volume, mostrare le immagini a colori.

### 14. Eventi: l'empty state occupa il primo schermo

Con nessun evento in programma la pagina apre con "Prossimamente" e un messaggio vuoto, e l'unico contenuto reale è sotto la piega. Fix: se `upcoming` è vuoto, mostrare direttamente l'archivio e un invito a seguire IG in fondo.

### 15. Home ridondante e lunga

La home desktop è alta 9.300 px con nove sezioni per 2 articoli, 1 evento, 3 volumi e 6 servizi. "Articoli" compare tre volte above the fold (nav, bento, header), "Ancora + Kasino" quattro volte in pagina. Con più contenuti la struttura regge; oggi va condizionata ai dati (vedi P1.4).

## P3 · Miglioramenti

### 16. Effetto macchina da scrivere su ogni titolo

`DynamicTitle` anima tutti gli `h1`/`h2`, compreso il titolo dell'articolo: 26 ms per carattere, un titolo di 60 caratteri appare in 1,6 s. All'idratazione il titolo già renderizzato dal server viene svuotato e riscritto (piccolo flash). Consiglio: tenerlo per la home e le hero di sezione, mai sugli `h1` di articoli ed eventi.

### 17. Link esterni senza avviso

IG, "Acquista", card del feed aprono in nuova scheda (`target="_blank"`) con la sola freccia ↗ come indizio. Aggiungere un testo `sr-only` "(si apre in una nuova scheda)".

### 18. Pagine di dettaglio scarne

- Articolo: manca autore linkato, categoria linkata, tempo di lettura, condivisione, "torna agli articoli".
- Evento archiviato: manca recap (foto, gallery), link a Instagram del post, altri eventi.
- Chi siamo: due frasi e due foto; nessun team, storia, stampa o contatti oltre al footer.

### 19. Footer minimo

Solo email, IG e logo. Mancano navigazione, privacy/cookie policy, dati legali (P. IVA se esiste un'attività commerciale con i volumi in vendita) e un eventuale consent manager, necessario se gli slot Google Publisher Tag negli articoli vengono attivati.

### 20. Ridondanze nell'header

"(UN SITO)" accanto al wordmark e "INDIPENDENTE · ITALIA" a destra ripetono "Magazine indipendente · Italia" nella hero, tre elementi nello stesso schermo.

### 21. Listing articoli con crop quadrato

Le cover verticali vengono ritagliate in un quadrato 220 px; con ritratti si perde la testa. Usare `object-position` da CMS o un ratio 4:5.

### 22. Alt delle immagini di contenuto

Le immagini delle gallery servizi e delle card sono `alt=""` (decorative) anche quando sono contenuto. Va bene per le card con testo adiacente; per la gallery servono descrizioni.

## Qualità del codice frontend

**Stack.** Next 16 App Router eseguito da Vinext su Cloudflare Workers, React 19, `next/image`, Sanity con fallback locale tipizzato. Struttura pulita: pagine come Server Component, quattro Client Component (header, titolo animato, form newsletter, slot pubblicitario). `tsc --noEmit` ed ESLint puliti. Un test di smoke sull'HTML renderizzato.

**Bundle.** Client JS di produzione ≈515 KB non compressi (framework 369 KB, indice 87 KB, image 43 KB): il codice proprio è minimo, il resto è React/RSC. Sanity Studio (2.9 MB) resta isolato su `/studio`.

**CSS.** `app/globals.css` è un unico file di 1.401 righe costruito per strati successivi che si sovrascrivono: base → "Responsive editorial refinement" → "SIAMO interaction system" → "Editorial bento" → "Full-screen feed" → tipografia. Conseguenze:

- `.site-header` è definito tre volte, `.bento-card` tre volte, `.mobile-nav` due volte con due modelli diversi (il primo per un `<details>` che non esiste più).
- Regole morte: `.header-brand-row`, `.mobile-nav summary`, `.footer-mark a { font-size: 38px }`, `.brand-art img { filter: invert(1) }` sovrascritto.
- Sette breakpoint (1180, 1020, 980, 900, 767, 620, 420) più `orientation`: l'header cambia a 980, il resto a 900.
- `:where()` in fondo riassegna i pesi tipografici, ma i `font-weight: 800/900` dichiarati prima restano in giro (la Bold copre 700–900, quindi sono equivalenti ma confusi).

Consiglio: consolidare in un solo strato per componente (CSS Modules o un file per sezione), fissare tre breakpoint (≈600, 900, 1180) e togliere le regole orfane. Il refactor è a rischio basso perché non ci sono test visivi: aggiungere Playwright con screenshot di regressione e axe prima di intervenire.

**Altri punti.**

- `site-image.tsx` è il singolo punto che spegne l'ottimizzazione immagini (vedi P2.6).
- I redirect dai vecchi URL Framer sono hardcoded per slug in `next.config.ts`; funzionano ma non scalano.
- `ArticleAdSlot` reimplementa i tipi di Google Publisher Tag: esiste `@types/google-publisher-tag`.
- `formatDate` usa `Intl` con `month: "short"`: produce "ago", "mag" con punto mancante in italiano ("15 ago 2026"); accettabile, ma valutare `month: "long"`.

## Roadmap consigliata

1. **Font.** Rigenerare o eliminare l'Oblique, WOFF2 per tutti, preload di Regular e Bold. Un pomeriggio, impatto su ogni pagina.
2. **Pagine di sistema.** `not-found.tsx` ed `error.tsx` brandizzati.
3. **Semantica home.** `h1` e `alt` sul wordmark; testo sr-only sui link esterni.
4. **Contenuti.** Sostituire i placeholder, condizionare le sezioni ai dati, togliere le metriche non verificabili, nascondere la newsletter finché non è attiva (con consenso quando lo sarà).
5. **Immagini.** Riattivare l'ottimizzazione, rimuovere gli asset orfani (8 MB), lazy sulle decorazioni.
6. **Mobile.** Snap `proximity`, altezze `min-height`, footer fuori dal feed.
7. **Servizi e timeline.** Titoli con container query, immagini a piena opacità, timeline con link.
8. **Contrasti** dei testi piccoli e coerenza dell'header.
9. **CSS.** Consolidare gli strati, tre breakpoint, test visivi e axe in CI.
