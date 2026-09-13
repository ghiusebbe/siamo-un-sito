# Pubblicità negli articoli

Il sito prevede al massimo due spazi pubblicitari, esclusivamente nelle pagine dei singoli articoli:

1. **Inline** — dopo il terzo blocco di testo, solo quando l’articolo contiene almeno cinque blocchi.
2. **Footer** — dopo il corpo dell’articolo e prima del collegamento al contenuto successivo.

Non sono previsti annunci in home, negli archivi, nelle pagine eventi, nei servizi o nella timeline. Non vengono usati formati sticky, interstitial o popup.

Gli spazi usano unità display AdSense in formato `horizontal`, responsive alla larghezza del contenitore. Uno spazio non configurato o non riempito scompare senza lasciare un riquadro vuoto.

## Configurazione

Il tag AdSense viene reso nell'`head` di ogni pagina, esattamente come lo fornisce Google (`async`, `crossorigin="anonymous"`), a partire dall'ID account:

```env
ADSENSE_PUBLISHER_ID=ca-pub-0000000000000000
```

La stessa variabile accetta anche la forma `pub-…` e compone la riga di `ads.txt`. Senza variabile il tag non viene emesso.

Poi crea due unità display nel pannello AdSense e inserisci i loro ID numerici:

```env
ADSENSE_ARTICLE_INLINE_SLOT=1234567890
ADSENSE_ARTICLE_FOOTER_SLOT=0987654321
```

Finché le variabili restano vuote non appare alcuno spazio pubblicitario. Prima dell'approvazione del sito da parte di AdSense non viene servito alcun annuncio, per quanto la configurazione sia completa.

**Tieni gli annunci automatici disattivati** nel pannello AdSense: con Auto ads accesi il tag inserirebbe annunci ovunque, anche in home e negli archivi, contro la regola dei due soli spazi negli articoli.

Ricorda di riportare in `ads.txt` tutte le righe che Google elenca per l'account, non solo quella AdSense (vedi sotto).

## Consenso

Gli annunci in Italia richiedono un CMP certificato IAB TCF. Usiamo *Privacy e messaggi* (Funding Choices) di AdSense: crea un messaggio GDPR, associa il dominio e pubblicalo. Non serve aggiungere script — il tag AdSense carica il CMP da sé e trattiene le richieste di annuncio finché non arriva il segnale TCF, quindi nessun annuncio parte prima della scelta dell'utente.

Il footer mostra "Gestisci il consenso" (`components/consent-link.tsx`) appena il CMP si annuncia: riapre il messaggio per revocare o modificare la scelta, come richiede il GDPR. Finché la pubblicità è spenta il pulsante non compare.

Il messaggio di consenso deve puntare alla pagina privacy e cookie policy del sito (`/privacy`).

## ads.txt

Google paga solo sui domini che dichiarano il venditore in `/ads.txt`. Il file non è nel repository: viene generato dalle variabili d’ambiente, e senza di esse la richiesta risponde 404.

```env
# La riga standard AdSense, composta dall’ID editore:
ADSENSE_PUBLISHER_ID=pub-0000000000000000

# Oppure il contenuto completo, se l’account richiede più righe:
ADS_TXT=google.com, pub-0000000000000000, DIRECT, f08c47fec0942fa0
```

`ADS_TXT` ha la precedenza e viene servito senza modifiche. Dopo il deploy verifica `https://tuo-dominio/ads.txt`: Google rilegge il file entro qualche giorno.
