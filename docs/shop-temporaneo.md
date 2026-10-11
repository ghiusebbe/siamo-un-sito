# Home temporanea e Shop

La home di lancio mostra un solo cartaceo. Il logo nell’header, Helvetica,
sfondo nero, bianco e verde acido provengono dall’identità esistente del sito.
La home editoriale e tutte le pagine restano nel repository e in Sanity.

## Preparazione in Sanity prima della pubblicazione della PR

1. In **Cartaceo / Shop**, crea o aggiorna il **volume 4**: titolo, copertina,
   **Link acquisto** HTTPS. Il sito usa esclusivamente i documenti pubblicati.
2. Facoltativamente aggiungi **Foto per lo shop**, descrizione, prezzo in euro,
   nota spedizione e **Preordini fino al**. La foto sostituisce la copertina solo
   nello shop; entrambe vengono mostrate intere, senza ritaglio.
3. Se i preordini terminano il 31 ottobre, imposta la data `2026-10-31`.
   Fino a fine giornata, ora di Roma, il pulsante dice **Preordina**; poi
   **Acquista**. Questa data non cambia la disponibilità né la spedizione.
4. **Coming Soon** continua a nascondere il link d’acquisto anche nel codice HTML.
   L’eventuale data **Uscita** lo abilita al primo rendering successivo alla scadenza.
5. Pubblica il cartaceo. In **Impostazioni sito**, attiva **Modalità temporanea:
   solo shop**, seleziona **Cartaceo in evidenza nello shop** e pubblica.

Senza una selezione viene cercato il volume 4 pubblicato. Un riferimento a una
bozza o a un documento mancante non mostra altri numeri al suo posto. Senza
documenti, il sito mostra un messaggio di disponibilità futura; senza link,
non compare un pulsante di pagamento. Non ci sono foto o checkout di ripiego.

## Cosa viene nascosto

In modalità temporanea `/` e `/shop` mostrano solo il cartaceo selezionato.
Menu e footer non mostrano le sezioni editoriali. I link diretti ad articoli,
eventi, timeline, servizi e chi siamo vengono reindirizzati alla home con **307**
e `Cache-Control: no-store`, conservando i parametri della campagna.
La sitemap include solo home, shop e privacy; RSS restituisce temporaneamente
503 per sospendere la distribuzione editoriale. Intro animata, newsletter e
pubblicità non compaiono nella home temporanea. Studio e privacy restano accessibili.

## Ripristinare il sito completo

Disattiva **Modalità temporanea: solo shop** in Impostazioni sito e **pubblica**.
Si ripristinano home, menu, footer, pagine, sitemap e RSS; `/shop` resta nel menu
e mostra tutti i cartacei pubblicati, in ordine di volume decrescente.
Non occorre modificare codice, cancellare documenti o eseguire una migrazione.
Le impostazioni hanno cache di 60 secondi e i cartacei di 5 minuti, oltre alla
cache CDN di Sanity: le modifiche non sono necessariamente istantanee.

I documenti esistenti privi di `shopOnly` avviano il sito in modalità temporanea.
Per una preview locale del sito completo senza Sanity si può impostare
`SIAMO_DEFAULT_SITE_MODE=editorial`. È solo il valore predefinito: un booleano
pubblicato in Sanity ha sempre precedenza. In caso di errore CMS lo shop non
pubblica prodotti o link statici di ripiego.

Il prezzo mostrato è informativo; importo finale, disponibilità, spedizione e
pagamento sono gestiti dal checkout esterno configurato nel documento.
