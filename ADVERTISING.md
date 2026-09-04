# Pubblicità negli articoli

Il sito prevede al massimo due spazi pubblicitari, esclusivamente nelle pagine dei singoli articoli:

1. **Inline** — dopo il terzo blocco di testo, solo quando l’articolo contiene almeno cinque blocchi.
2. **Footer** — dopo il corpo dell’articolo e prima del collegamento al contenuto successivo.

Non sono previsti annunci in home, negli archivi, nelle pagine eventi, nei servizi o nella timeline. Non vengono usati formati sticky, interstitial o popup.

Gli spazi usano Google Ad Manager con formati responsive:

- desktop: `970×90` e `728×90`;
- mobile: `320×100` e `300×100`.

Il caricamento è differito finché l’annuncio non si avvicina alla viewport. Uno spazio non configurato o non riempito scompare senza lasciare un riquadro vuoto.

## Configurazione

Inserire i percorsi completi delle unità pubblicitarie nelle variabili:

```env
GAM_ARTICLE_INLINE_PATH=/NETWORK_ID/UNITA_INLINE
GAM_ARTICLE_FOOTER_PATH=/NETWORK_ID/UNITA_FOOTER
```

Finché le variabili restano vuote non viene caricato Google Publisher Tag e non appare alcuno spazio pubblicitario. Prima dell’attivazione pubblica va collegata la gestione del consenso scelta per il sito.

## AdSense

AdSense non ha un tag proprio sul sito: l'account viene collegato ad Ad Manager come fonte di domanda, così gli annunci AdSense competono per gli stessi due spazi già serviti da Google Publisher Tag. In Ad Manager: *Amministrazione → Collegamenti account → AdSense*, poi abilita la domanda AdSense sulle due unità. Sul sito non cambia nulla: un solo script, nessun doppio conteggio.

Ricorda di riportare in `ads.txt` tutte le righe che Google elenca per l'account, non solo quella AdSense (vedi sotto).

## Consenso

Gli annunci in Italia richiedono un CMP certificato IAB TCF. Usiamo *Privacy e messaggi* (Funding Choices) di Ad Manager: crea un messaggio GDPR, associa il dominio e pubblicalo. Non serve aggiungere script — Google Publisher Tag carica il CMP da sé sulle pagine che hanno uno spazio configurato, e trattiene le richieste di annuncio finché non arriva il segnale TCF, quindi nessun annuncio parte prima della scelta dell'utente.

Il footer mostra "Gestisci il consenso" (`components/consent-link.tsx`) appena il CMP si annuncia: riapre il messaggio per revocare o modificare la scelta, come richiede il GDPR. Finché la pubblicità è spenta il pulsante non compare.

Resta da scrivere la pagina privacy e cookie policy, a cui il messaggio di consenso deve puntare: oggi il sito non ne ha una.

## ads.txt

Google paga solo sui domini che dichiarano il venditore in `/ads.txt`. Il file non è nel repository: viene generato dalle variabili d’ambiente, e senza di esse la richiesta risponde 404.

```env
# La riga standard AdSense, composta dall’ID editore:
ADSENSE_PUBLISHER_ID=pub-0000000000000000

# Oppure il contenuto completo, se l’account richiede più righe:
ADS_TXT=google.com, pub-0000000000000000, DIRECT, f08c47fec0942fa0
```

`ADS_TXT` ha la precedenza e viene servito senza modifiche. Dopo il deploy verifica `https://tuo-dominio/ads.txt`: Google rilegge il file entro qualche giorno.
