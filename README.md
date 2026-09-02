# SIAMO Un Magazine

Migrazione completa del sito SIAMO da Framer a Next.js con Sanity Studio.

## Avvio locale

```bash
npm install
cp .env.example .env.local
npm run dev
```

Il sito funziona subito con i contenuti migrati inclusi nel repository. Il pannello CMS è disponibile su `/studio` dopo aver collegato un progetto Sanity.

## Collegare il CMS

1. Crea un progetto su Sanity e un dataset `production`.
2. Copia `.env.example` in `.env.local` e inserisci `NEXT_PUBLIC_SANITY_PROJECT_ID`.
3. Crea un token Editor e inseriscilo come `SANITY_API_WRITE_TOKEN`.
4. Aggiungi `http://localhost:3000` e il dominio definitivo tra le CORS origins del progetto Sanity.
5. Esegui `npm run seed` una sola volta per importare testi e immagini iniziali.

Il frontend passa automaticamente dai dati inclusi a quelli del CMS appena il progetto è configurato.

La build per la pubblicazione usa Vinext/Cloudflare Workers, mentre i comandi Next.js originali restano compatibili con il progetto sorgente di migrazione.

## Immagini

Le immagini locali e quelle pubblicate da Sanity vengono ridimensionate automaticamente in base al dispositivo, convertite in AVIF o WebP quando supportato e servite con cache. Ogni layout dichiara le dimensioni responsive per evitare download inutilmente grandi.

## Contenuti gestibili

- Articoli e autori
- Eventi, lineup e link biglietti
- Servizi, FAQ e gallerie
- Timeline
- Volumi digitali
- Impostazioni generali e statistiche
- Iscritti alla newsletter

## URL migrati

I vecchi URL `/articoli-cms/*` e `/eventi-cms/*` effettuano redirect permanenti verso i nuovi URL puliti.
