# Newsletter automatica con Brevo Free

## Cosa fa il progetto

- `POST /api/newsletter` registra l'indirizzo nella lista Brevo dopo email valida e consenso esplicito. Nessun invio di email da Sanity o dal sito.
- `GET /feed.xml` pubblica fino a 50 articoli Sanity: titolo, copertina, anteprima, autore, data e link. Esclude bozze, date future e documenti incompleti. Se Sanity non risponde restituisce 503; non usa i contenuti dimostrativi del sito.
- L'identificatore RSS deriva dall'ID Sanity; la data è `publishedAt`, mai `_updatedAt`. Per correggere un articolo senza riproporlo nella newsletter, conserva la data di pubblicazione. Non cancellare e ricreare il documento.
- Brevo legge il feed e decide quando spedire. Non serve un webhook, un cron a pagamento o Gmail.

## 1. Collegare le iscrizioni

1. Crea un account Brevo Free e una lista dedicata, per esempio **SIAMO Newsletter**. Annota l'ID numerico della lista.
2. Crea questi attributi dei contatti, tutti di tipo **Testo**: `SIAMO_CONSENT_AT`, `SIAMO_CONSENT_VERSION`, `SIAMO_CONSENT_SOURCE`. Il sito registra data/ora ISO, versione del consenso e pagina di origine. Brevo ignora attributi non definiti: creali prima di aprire le iscrizioni.
3. Genera una chiave API v3 nelle impostazioni **SMTP & API** e imposta sul server:

   ```dotenv
   BREVO_API_KEY=la_tua_chiave_api
   BREVO_LIST_ID=42
   ```

   `42` è un esempio. Usa lo stesso ID anche come lista destinatari RSS. La chiave va nei segreti dell'hosting, mai nel repository o in variabili `NEXT_PUBLIC_*`.
4. Assicurati che `SANITY_PROJECT_ID` e `SANITY_DATASET` siano configurati con il dataset pubblico del sito. Pubblica la nuova versione per rendere disponibile il feed.
5. Prova il form con un tuo indirizzo e verifica lista e attributi in Brevo. Questa integrazione mantiene l'iscrizione con checkbox, senza email di conferma e senza double opt-in. I contatti già presenti vengono aggiornati senza forzare la riattivazione di chi si è disiscritto.

Le vecchie variabili `BEEHIIV_*` non vengono più usate. Gli iscritti già in beehiiv e nell'archivio Sanity non vengono trasferiti né cancellati automaticamente. Se li importi in Brevo, preserva consenso ed esclusioni dagli invii.

## 2. Attivare RSS Campaign in Brevo

Questa configurazione nell'account è necessaria: il deploy del codice da solo non attiva la newsletter.

1. Verifica il mittente e autentica il dominio `siamounmagazine.com` seguendo i record DNS indicati da Brevo. Scegli un indirizzo mittente e un Reply-To che gestisci.
2. Apri **Integrations → RSS Campaign → Create**.
3. Inserisci `https://siamounmagazine.com/feed.xml` e carica il feed. Deve essere raggiungibile pubblicamente e restituire XML, senza autenticazione o protezione anteprima.
4. Parti da **RSS Default Template**. Personalizza logo e colori, mantenendo i blocchi RSS ripetuti per gli articoli e il link di disiscrizione. Il campo RSS `description` contiene l'anteprima HTML con immagine e link; `media:content` espone anche la copertina separatamente. Controlla la resa nell'anteprima del template scelto.
5. Seleziona la lista **SIAMO Newsletter**, lo stesso ID di `BREVO_LIST_ID`. Imposta nome mittente **SIAMO** e oggetto, per esempio **Le novità di SIAMO**.
6. Scegli una frequenza giornaliera, tutti i giorni, per esempio alle **19:00** nel fuso dell'account. Seleziona **Automatically**, poi **Save and activate** dopo aver controllato anteprima e destinatari del primo invio.

Il servizio invia solo quando trova novità rispetto all'ultimo controllo. Raggruppa i nuovi articoli nell'invio programmato: non spedisce istantaneamente dopo ogni pubblicazione. Crea l'integrazione e pubblica gli articoli almeno un'ora prima dell'orario scelto. Brevo elabora al massimo 10 articoli per campagna RSS: se ne pubblichi di più tra due invii, controlla che non vadano persi. Verifica il primo contenuto in anteprima prima dell'attivazione, soprattutto se il feed contiene già un archivio.

## Limiti del piano gratis

Brevo Free consente **300 email al giorno**, conteggiate per destinatario e condivise con gli altri invii dell'account, senza riporto dei crediti inutilizzati. Con 100 iscritti, una newsletter consuma 100 invii. Oltre 300 destinatari un singolo invio non raggiunge automaticamente tutta la lista: non considerare questa soluzione gratuita senza limiti. Il piano mantiene il marchio Brevo.

## Verifica e manutenzione

- Controlla `/feed.xml`: 200 e `Content-Type: application/rss+xml`; un dataset vuoto dà un feed vuoto, una configurazione mancante o un errore Sanity dà 503 senza cache.
- Dopo un nuovo articolo controlla GUID, data, anteprima e link nel feed (cache pubblica fino a 5 minuti), poi il report RSS in Brevo all'orario scelto.
- Una correzione con la stessa data e ID deve mantenere GUID e `pubDate`; nessun cambiamento produce nuove date a ogni richiesta.
- Se il form non compare, verifica chiave e ID lista intero positivo. Se restituisce 502, controlla credenziali, lista e restrizioni IP dell'account. Gli errori nei log non contengono email o chiavi.
- I test automatici usano risposte Brevo e Sanity simulate e non iscrivono persone né spediscono messaggi reali. Esegui `npm test` dopo l'installazione delle dipendenze.

## Documentazione ufficiale

- [Brevo: integrazione RSS Campaign](https://help.brevo.com/hc/en-us/articles/360013130059-RSS-Campaign-integration-Automatically-share-your-blog-posts-with-your-subscribers)
- [Brevo: limiti del piano Free](https://help.brevo.com/hc/en-us/articles/208580669-FAQs-What-are-the-limits-of-the-Free-plan)
- [Brevo API: creazione e aggiornamento contatti](https://developers.brevo.com/reference/create-contact)
