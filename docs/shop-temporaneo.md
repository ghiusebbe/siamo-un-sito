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
La sitemap include solo home, shop, privacy e condizioni di vendita; RSS restituisce temporaneamente
503 per sospendere la distribuzione editoriale. Intro animata, newsletter e
pubblicità non compaiono nella home temporanea. Studio, privacy e condizioni di vendita restano accessibili.

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

## Condizioni di vendita e checkout Stripe

Le pagine `/condizioni-vendita` e `/privacy` sono sempre raggiungibili dal footer,
anche nella modalità temporanea. Le condizioni riguardano solo i singoli numeri
cartacei della rivista, senza abbonamenti o rinnovi. Prevedono l’eccezione al
recesso per riviste dell’art. 59, comma 1, lettera l), mantenendo garanzia legale
e rimedi per mancata consegna. Prima del lancio va verificato che la pubblicazione
rientri effettivamente in questa categoria: non estendere il testo a libri,
merchandising o abbonamenti. Per prodotti con diritto di recesso occorrono
condizioni diverse e la funzione di recesso online prevista dalla normativa vigente.

Prima di abilitare il link live:

1. Verifica i dati del venditore già presenti nel repo (SIAMO, sede a Torino,
   codice fiscale 97928370010), l’email assistenza in Sanity, il regime fiscale
   applicabile e gli eventuali ulteriori dati identificativi obbligatori.
   Nel repo manca il recapito telefonico del venditore: fornirlo e aggiungerlo
   alle condizioni/informazioni di contatto prima di aprire le vendite ai consumatori.
2. Crea in Stripe un Payment Link **una tantum** per il prodotto fisico.
   Configura prezzo, imposte applicabili, quantità/disponibilità, Paesi serviti
   e tariffe di spedizione. Allinea il prezzo in Sanity al checkout.
3. Attiva la raccolta di **nome, email e indirizzo di spedizione**; il solo indirizzo
   di fatturazione non basta. Richiedi il telefono solo se serve al vettore.
4. Indica prima del pagamento i tempi di consegna, anche per i preordini, nella
   nota spedizione in Sanity e nelle informazioni del checkout. Fine preordini
   e data di uscita non impostano una data di consegna. In mancanza di un diverso
   termine concordato, le condizioni richiamano il termine legale di 30 giorni.
5. Nelle informazioni pubbliche Stripe collega
   `https://siamounmagazine.com/condizioni-vendita` e
   `https://siamounmagazine.com/privacy`, attiva l’accettazione delle condizioni
   e rendi visibile nel checkout l’assenza del recesso per ripensamento per il
   singolo numero di rivista. Verifica che il comando finale esprima l’obbligo di pagare.
6. Attiva le ricevute email e le notifiche di pagamento. Per ogni pagamento riuscito
   invia anche una **conferma dell’ordine** con prodotto, quantità, totale, indirizzo,
   tempi concordati e una copia conservabile delle condizioni della versione
   acquistata (testo completo nell’email o allegato). La sola ricevuta Stripe o
   un link a una pagina modificabile non sostituiscono questa conferma.
   Il sito non automatizza questo invio: predisporre il processo manuale prima
   del lancio oppure implementare un’integrazione dedicata.
7. Organizza spedizioni, assistenza, sostituzioni/rimborsi e documentazione fiscale:
   Stripe non spedisce il cartaceo e la sua ricevuta non è automaticamente un documento fiscale.
8. Prova il flusso in modalità test: indirizzo obbligatorio, costi, tempi, link
   legali accessibili, pagamento riuscito/fallito, conferma e recupero dei dati
   per la consegna. Poi inserisci in Sanity il Payment Link **live** e pubblica.

Gli ordini e gli indirizzi restano nell’area riservata Stripe e negli strumenti
privati necessari alla consegna/contabilità, con accessi limitati. Non importarli
nel dataset Sanity pubblico. Definisci una procedura di conservazione e cancellazione
coerente con l’informativa: non conservare ogni indirizzo indefinitamente.
La PR aggiunge i testi e i link; non configura l’account Stripe, non imposta
spedizioni e non invia conferme d’ordine o ricevute.

### Riferimenti per la revisione

- [Codice del consumo — MIMIT](https://www.mimit.gov.it/it/mercato-e-consumatori/tutela-del-consumatore/codice-del-consumo)
- [Codice del consumo vigente — Gazzetta Ufficiale](https://www.gazzettaufficiale.it/sommario/codici/consumo)
- [Vendite a distanza — Your Europe](https://europa.eu/youreurope/business/selling-in-eu/selling-goods-services/ecommerce-distance-selling/index_it.htm)
- [Garanzia legale — MIMIT](https://www.mimit.gov.it/it/assistenza/domande-frequenti/le-garanzie-post-vendita-domande-frequenti-faq)
- [Payment Links: indirizzi e condizioni — Stripe](https://docs.stripe.com/payment-links/customize)
- [Dopo il pagamento — Stripe](https://docs.stripe.com/payment-links/post-payment)
- [Ruoli privacy — Stripe](https://stripe.com/legal/privacy-center)
