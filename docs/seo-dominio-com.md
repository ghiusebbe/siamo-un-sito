# SEO: dominio siamounmagazine.com

## Modifiche nel branch

- Dominio editoriale fisso `https://siamounmagazine.com` in `lib/site-url.ts`, anche se SITE_URL o le variabili Vercel contengono un indirizzo precedente. Nessuna dipendenza dal dominio del deploy per canonical, sitemap, Open Graph o JSON-LD.
- Canonical specifico per home, pagine statiche, privacy e dettagli di articoli, eventi e servizi; le pagine mancanti restano 404. Lo Studio è escluso dall'indicizzazione.
- Description specifiche per le pagine statiche. Open Graph e Twitter `summary_large_image` per tutte le pagine pubbliche; articoli con titolo, excerpt (sottotitolo o descrizione coerente se vuoto), URL e cover da Sanity.
- JSON-LD globale Organization/WebSite e Article nei dettagli: autore, headline, immagine, pubblicazione, modifica, publisher e URL coerenti. Il testo Sanity è serializzato escapando `<` per impedire la chiusura dello script. I dati mancanti non vengono inventati.
- H1 home con testo accessibile «SIAMO — magazine di musica e cultura emergente» e wordmark invariato.
- `_updatedAt` nelle proiezioni Sanity di articoli, eventi e servizi e nella sitemap, rigenerabile ogni 5 minuti. Per gli articoli senza aggiornamento noto si usa la pubblicazione; per eventi/servizi e pagine statiche senza data nota, lastmod è omesso. Mai la data di svolgimento dell'evento né la data di build.
- Proxy compatibile con Next.js 16 e Vinext: redirect 308 da www e dall'alias Vercel precedente, mantenendo percorso e query string; header `X-Robots-Tag: noindex, follow` sulle altre URL `.vercel.app`. Il dominio `.com` principale non riceve noindex.
- Cover Sanity responsive con `srcset`, `sizes`, preload responsive delle immagini prioritarie e conversione/compressione CDN. Le immagini locali continuano a essere servite direttamente. Il markup nativo delle immagini Sanity evita il limite del loader custom di Vinext, che non emette srcset; non aggiunge wrapper e conserva dimensioni e classi CSS.
- Campo opzionale «Testo alternativo» sulla copertina degli articoli in Sanity, usato su dettaglio, elenco, home e anteprime social. Finché non viene compilato si mantiene un fallback basato sul titolo.
- Documentazione Sanity ed esempio di ambiente aggiornati al `.com`. Nessun riferimento a `siamounmagazine.it` nel codice applicativo; i vecchi resoconti di debug conservano i domini storici come contesto.

## Verifiche eseguite

- Build Vinext e build nativa `next build --webpack`, TypeScript e lint. Verifica del server di produzione Next.js con `node scripts/verify-next-seo.mjs` (dopo la build senza Sanity, con i contenuti di fallback): HTML, canonical, robots, sitemap, redirect con query e header distinti per dominio.
- 29 test automatici: pagine generate, contenuti Sanity vuoti, animazione, canonical per le pagine pubbliche, metadata e JSON-LD con fixture Sanity, date della sitemap, redirect con query string, esclusione preview e Studio. Test SEO con testo ostile per verificare l'escape JSON-LD.
- Controllo browser della home a larghezza mobile 390 px (375 px utili con scrollbar): nessun overflow della pagina, immagini caricate e menu funzionante. La preview HTTP presenta un limite preesistente di Vinext (`crypto.subtle` non disponibile, navigazione con ricaricamento): non è una misura delle prestazioni del deploy HTTPS Next.js.
- Animazione già limitata a 30 fps su mobile, densità canvas ridotta, arresto fuori viewport e supporto reduced-motion: comportamento conservato. Font WOFF2 con preload e `font-display: swap` già presenti, conservati.
- Misura di una cover reale da Sanity: 109.527 byte con parametri attuali 1600 px/q78, 48.880 byte a 828 px/q75, 22.112 byte a 480 px/q75. Risparmio del 55% o 80% su questo campione; non rappresenta un punteggio globale né un miglioramento LCP misurato. Il formato restituito dal CDN può variare.
- PageSpeed API ha risposto 429 per quota esaurita: Core Web Vitals/CrUX non certificati. Nessun accesso ai report privati Search Console in questa sessione.

## Stato live prima del deploy — 7 settembre 2026

| Verifica | Risultato |
| --- | --- |
| www.siamounmagazine.com | 308 verso https://siamounmagazine.com/ |
| siamo-un-sito.vercel.app | 307 temporaneo verso https://siamounmagazine.com/ |
| robots.txt | Allow `/`, Disallow `/studio/`, sitemap `.com` corretta |
| Sitemap | URL `.com`; lastmod degli articoli basato sulla pubblicazione |
| Home, /articoli, /eventi, /servizi, /timeline, /chi-siamo | HTTP 200, nessun meta/header noindex, canonical assente |
| /articoli/vedere-la-musica-stef5k e /articoli/storma-provincia-parla-citta | HTTP 200, nessun meta/header noindex, canonical assente |

Questi risultati descrivono il sito precedente alle modifiche del branch; non attestano indicizzazione o canonical scelta da Google.

## Passaggi del proprietario

1. Creare la merge request dal branch `codex/seo-canonical-com`, esaminare le modifiche, fare merge e redeploy. Il branch non cambia build command o impostazioni del progetto Vercel. La pipeline Sites rimane compatibile; Vercel deve continuare a usare la build Next.js già configurata.
2. In Vercel → progetto → Settings → Domains, mantenere `siamounmagazine.com` come dominio principale; confermare www → `.com` permanente e cambiare il redirect dell'alias `siamo-un-sito.vercel.app` da 307 a 308. Il redirect impostato a livello di dominio può rispondere prima del codice e non viene sostituito da un deploy.
3. Tenere `SITE_URL=https://siamounmagazine.com` per le integrazioni e autorizzare l'origine `.com` nel CORS Sanity se necessario. Non occorre migrare il dataset. I nuovi testi alternativi sono opzionali e possono essere compilati gradualmente.
4. Aggiornare i campi sito web e i link in bio degli account ufficiali Instagram, LinkedIn, eventuali aggregatori di link, altri profili e schede partner. Non sono stati modificati: manca accesso di gestione e non è disponibile l'elenco completo dei profili. L'URL nuovo è `https://siamounmagazine.com`.
5. Esportare da Search Console i link esterni al vecchio dominio, se si dispone della relativa proprietà, o raccogliere l'elenco dei partner. Verificare le pagine e contattare i rispettivi referenti chiedendo l'aggiornamento al `.com`, preservando il percorso corretto degli articoli. Non sono stati inviati messaggi: non sono disponibili destinatari verificati o un elenco dei backlink da correggere. Il progetto non controlla il vecchio `.it`, quindi non può implementarne il redirect.

Testo suggerito per i partner: «Ciao, il sito ufficiale di SIAMO è ora https://siamounmagazine.com. Nella vostra pagina [URL] è ancora presente il link al precedente dominio siamounmagazine.it: potete aggiornarlo a [nuovo URL corrispondente]? Grazie!»

## Dopo il deploy

- Verificare home e un articolo con sorgente HTML: un canonical `.com`, description, Open Graph, Twitter `summary_large_image`, JSON-LD valido e nessun noindex.
- Controllare `/robots.txt` e `/sitemap.xml`; confrontare lastmod con `_updatedAt` del documento pubblicato Sanity. Le query usano la prospettiva published e la cache già esistente.
- Verificare redirect 308 di www/alias Vercel anche su un percorso articolo con query, e noindex sulle preview accessibili.
- In Search Console inviare `https://siamounmagazine.com/sitemap.xml`. In Controllo URL provare home e almeno due articoli, eseguire Test URL pubblicato e richiedere indicizzazione quando appropriato.
- Dopo il nuovo crawl controllare «Canonica dichiarata dall'utente» e «Canonica selezionata da Google»: devono riferirsi alla stessa pagina `.com`. La scelta di Google non è verificabile prima del crawl.
- Consultare indicizzazione pagine ed errori sitemap; aprire il report Core Web Vitals mobile. Usare PageSpeed Insights/Lighthouse per home e un articolo, con cache fredda, inclusa la prima visita con intro. I dati sul campo non si aggiornano immediatamente al deploy.

Riferimenti tecnici: [Metadata Next.js](https://nextjs.org/docs/app/api-reference/functions/generate-metadata), [JSON-LD Next.js](https://nextjs.org/docs/app/guides/json-ld), [Article Google Search](https://developers.google.com/search/docs/appearance/structured-data/article), [Sitemap Google Search](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap).
