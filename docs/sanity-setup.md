# Collegare Sanity CMS

Il codice è già pronto: Studio embedded su `/studio`, sette tipi di contenuto in `sanity/schemaTypes`, client con cache e fallback in `lib/content.ts`, script di importazione in `scripts/seed-sanity.mjs`. Finché il progetto non è collegato il sito mostra i contenuti di fallback inclusi nel repo. Questa guida porta dal repo a un CMS funzionante in produzione.

## 1. Creare il progetto Sanity

1. Accedi o registrati su [sanity.io](https://www.sanity.io/) (il piano gratuito basta per iniziare).
2. Dalla cartella del progetto lancia:

   ```bash
   npx sanity login
   npx sanity projects create "SIAMO"
   ```

   Segna il **Project ID** stampato a fine comando (una stringa tipo `ab12cd34`). In alternativa crea il progetto da [sanity.io/manage](https://www.sanity.io/manage) e copia l'ID dalla pagina del progetto.
3. Il dataset `production` viene creato con il progetto. Se non c'è: `npx sanity dataset create production --visibility public`.

## 2. Variabili d'ambiente locali

```bash
cp .env.example .env.local
```

Compila `.env.local`:

| Variabile | Valore |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` in locale, il dominio definitivo in produzione |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | il Project ID del passo 1 |
| `NEXT_PUBLIC_SANITY_DATASET` | `production` |
| `SANITY_API_WRITE_TOKEN` | token con permessi **Editor** (passo 3) |

Le due variabili `NEXT_PUBLIC_GAM_*` riguardano la pubblicità e possono restare vuote.

## 3. Token di scrittura

Serve allo script di importazione e all'API della newsletter.

1. Apri `npm run sanity:manage`, oppure vai su sanity.io/manage e scegli il progetto.
2. **API → Tokens → Add API token**: nome `siamo-site`, permessi **Editor**.
3. Copia il token in `SANITY_API_WRITE_TOKEN`. Viene mostrato una sola volta.

Il token non deve mai finire nel repository: `.env*` è già in `.gitignore`.

## 4. CORS

Lo Studio gira dentro il sito, quindi il browser parla direttamente con l'API di Sanity. Nella stessa pagina **API → CORS origins** aggiungi, con "Allow credentials" attivo:

- `http://localhost:3000`
- `http://localhost:5173` (il dev server Vite)
- il dominio di produzione, per esempio `https://siamo-un-sito.vercel.app`
- eventuali domini di preview

Senza questa voce lo Studio si apre ma non riesce a caricare né salvare documenti.

## 5. Importare i contenuti iniziali

Una sola volta, dopo aver compilato `.env.local`:

```bash
npm run seed
```

Lo script carica le immagini di `public/media` come asset e crea impostazioni, tre volumi, due articoli, un evento, sei servizi e otto voci di timeline con gli stessi ID dei fallback. Rilanciarlo sovrascrive i documenti con quei contenuti (e ricarica le immagini): usalo solo all'inizio, poi lavora in Studio.

I due articoli e l'evento importati sono ancora segnaposto ("Titolo format in generale", "Ciao, qua c'è il testo…"): vanno riscritti o cancellati in Studio prima di andare online con il CMS.

## 6. Verificare in locale

```bash
npm run dev
```

- `http://localhost:5173/studio` deve mostrare lo Studio con i sette tipi di documento nella colonna di sinistra. Se vedi la schermata "Collega il CMS" la variabile `NEXT_PUBLIC_SANITY_PROJECT_ID` non è stata letta: riavvia il dev server.
- La home deve mostrare gli stessi contenuti di prima, ma le immagini arrivano da `cdn.sanity.io`.
- Modifica un titolo in Studio e pubblica: in locale la modifica compare al refresh; in produzione entro il tempo di cache (vedi sotto).

## 7. Produzione

Nel pannello dell'hosting (Vercel: Settings → Environment Variables) inserisci le stesse quattro variabili del passo 2, con `NEXT_PUBLIC_SITE_URL` impostato sul dominio pubblico, e rilancia il deploy. Aggiungi il dominio alle CORS origins (passo 4).

Poi invita la redazione: **Members → Invite** su sanity.io/manage. Ruolo **Editor** per chi scrive, **Administrator** solo per chi gestisce il progetto. Ognuno accede allo Studio su `https://tuo-dominio/studio` con il proprio account Sanity.

## 8. Come si comporta il sito con il CMS

- **Cache.** Le letture usano il CDN di Sanity e una cache applicativa: articoli ed eventi 5 minuti, servizi, timeline e impostazioni 1 ora, volumi 24 ore. Una modifica in Studio compare in produzione al più tardi dopo questo tempo.
- **Fallback.** Se Sanity non risponde o una query fallisce, il sito serve i contenuti del repo e logga l'errore. Una collezione vuota nel CMS resta vuota.
- **Immagini.** Gli URL del CDN Sanity ricevono automaticamente `auto=format&fit=max&w=1600&q=78`: carica pure originali ad alta risoluzione, il CDN li serve ridotti e in WebP/AVIF.
- **Sezioni condizionali della home.** "Ultime storie" appare con almeno due articoli; la promo evento solo con un evento in stato "Prossimamente"; i numeri solo se compilati in Impostazioni sito; la newsletter solo con il token configurato.
- **Newsletter.** Le iscrizioni diventano documenti "Iscritto newsletter" con email, data e consenso. Esporta la lista da Studio o via API quando serve.

## 9. Guida editoriale rapida

| Tipo | Campi da curare | Note |
| --- | --- | --- |
| Articolo | titolo, URL, categoria, anteprima (max 240), copertina, autore, data, contenuto | La copertina in verticale 4:5 rende meglio nelle liste. "In evidenza" è pronto per usi futuri. |
| Evento | nome, data, venue, città, lineup, locandina, biglietti, stato | Passa a "Archivio" a evento concluso, altrimenti resta in "Prossimamente" e nella promo in home. |
| Servizio | nome, ordine, tagline, intro, immagine principale, galleria, cosa facciamo, FAQ | L'ordine decide la sequenza nella pagina e in home. |
| Timeline | titolo, anno, ordine nell'anno, immagine, collegamento | Il collegamento rende cliccabile la voce (es. `/eventi/ancora-kasino`). |
| Cartaceo digitale | titolo, volume, copertina, link acquisto | Il link è il checkout Lemon Squeezy. |
| Impostazioni sito | nome, descrizione, email, Instagram, numeri | Un solo documento. I numeri compaiono in home solo se inseriti. |

## 10. Passi successivi (opzionali)

- **Aggiornamento immediato.** Un webhook Sanity verso una route di revalidazione permette di azzerare la cache alla pubblicazione invece di attendere il TTL. Da valutare dopo aver verificato il supporto di `revalidateTag` nel runtime Vinext/Cloudflare.
- **Anteprima bozze.** Con `perspective: "previewDrafts"` e un token di lettura si può mostrare alla redazione l'articolo prima della pubblicazione.
- **Studio separato.** Se il bundle di `/studio` (circa 3 MB) pesasse sul deploy, `npx sanity deploy` pubblica lo Studio su `*.sanity.studio` senza toccare il sito.
