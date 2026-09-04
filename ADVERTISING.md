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

## ads.txt

Google paga solo sui domini che dichiarano il venditore in `/ads.txt`. Il file non è nel repository: viene generato dalle variabili d’ambiente, e senza di esse la richiesta risponde 404.

```env
# La riga standard AdSense, composta dall’ID editore:
ADSENSE_PUBLISHER_ID=pub-0000000000000000

# Oppure il contenuto completo, se l’account richiede più righe:
ADS_TXT=google.com, pub-0000000000000000, DIRECT, f08c47fec0942fa0
```

`ADS_TXT` ha la precedenza e viene servito senza modifiche. Dopo il deploy verifica `https://tuo-dominio/ads.txt`: Google rilegge il file entro qualche giorno.
