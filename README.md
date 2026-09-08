# SIAMO Magazine

Migrazione completa del sito SIAMO da Framer a Next.js con Sanity Studio.

## Avvio locale

```bash
npm install
cp .env.example .env.local
npm run dev
```

Il sito funziona subito con i contenuti migrati inclusi nel repository. Il pannello CMS è disponibile su `/studio` dopo aver collegato un progetto Sanity.

## Collegare il CMS

Guida completa passo-passo in [docs/sanity-setup.md](docs/sanity-setup.md).

1. Crea un progetto su Sanity e un dataset `production`.
2. Copia `.env.example` in `.env.local` e inserisci `SANITY_PROJECT_ID`.
3. Crea un token Editor e inseriscilo come `SANITY_API_WRITE_TOKEN`.
4. Aggiungi `http://localhost:3000` e il dominio definitivo tra le CORS origins del progetto Sanity.
5. Esegui `npm run seed` una sola volta per importare testi e immagini iniziali.

Il frontend passa automaticamente dai dati inclusi a quelli del CMS appena il dataset contiene almeno un documento pubblicato: finché è vuoto continua a mostrare i contenuti inclusi nel repository.

La build per la pubblicazione usa Vinext/Cloudflare Workers, mentre i comandi Next.js originali restano compatibili con il progetto sorgente di migrazione.

## Immagini

Le immagini in `public/media` sono servite così come sono committate (l'ottimizzatore di Vinext è disattivato in `next.config.ts` e `components/site-image.tsx` perché in produzione rompeva il caricamento delle card). Vanno quindi salvate già alla dimensione giusta: massimo 1600 px sul lato lungo, JPEG a qualità 75-80 o WebP, sotto i 200 KB. Ogni layout dichiara comunque `width`, `height` e `sizes`, così il giorno in cui l'ottimizzatore verrà riattivato non servirà toccare i componenti.

## Font

Il sito usa due tagli di Helvetica in WOFF2 (`public/fonts`): Regular e Bold. Il corsivo è sintetizzato dal Regular (`font-synthesis: style`), perché il file Oblique originale era danneggiato e i browser lo scartavano.

## Newsletter automatica (Brevo Free)

Il form invia le iscrizioni a Brevo tramite `/api/newsletter`, con chiave API solo lato server.
Il feed `/feed.xml` espone gli ultimi 50 articoli pubblicati su Sanity, con copertina,
anteprima e link. Brevo controlla il feed e gestisce gli invii tramite **RSS Campaign**.

Imposta `BREVO_API_KEY` e `BREVO_LIST_ID`, poi configura la campagna RSS nell'account.
Il form rimane nascosto finché entrambe le variabili non sono valide.
L'automazione non si attiva con il solo deploy: segui [la guida Brevo](docs/newsletter-brevo.md).
Non sono necessari webhook Sanity, cron del sito o un account Gmail.

## Contenuti gestibili

- Articoli e autori
- Eventi, lineup e link biglietti
- Servizi, FAQ e gallerie
- Timeline
- Volumi digitali
- Impostazioni generali e statistiche
- Iscritti alla newsletter (archivio storico, sola lettura)

## URL migrati

I vecchi URL `/articoli-cms/*` e `/eventi-cms/*` effettuano redirect permanenti verso i nuovi URL puliti.

## Architettura dati e cache

Sanity è l'unica source of truth applicativa per i contenuti: articoli, eventi, servizi, timeline, magazine e impostazioni sono gestiti dal Content Lake. Gli iscritti alla newsletter vivono invece su Brevo. Il progetto non richiede un database D1/Drizzle parallelo.

Le letture pubbliche usano il CDN di Sanity e una cache applicativa con TTL differenziati:

- articoli ed eventi: 5 minuti;
- servizi, timeline e impostazioni: 1 ora;
- magazine: 24 ore.

Questo evita una richiesta origin a Sanity per ogni pageview e mantiene più freschi i contenuti editoriali che cambiano spesso. I fallback locali vengono usati solo quando Sanity non è configurato, non risponde o restituisce un valore nullo; una collezione CMS volutamente vuota resta vuota.

Su deployment Cloudflare molto trafficati si può aggiungere in seguito un backend condiviso per la Data Cache di Vinext (per esempio KV) senza reintrodurre un database applicativo.
