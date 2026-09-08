# Immagini locali più leggere

Le 21 immagini in `public/media` conservano gli originali. Durante la build,
`scripts/prepare-images.mjs` produce copie WebP di qualità 78 da 320 a 1600 px,
senza ritaglio né ingrandimento. Una copia viene usata solo se pesa meno
dell'originale; per gli originali già molto compressi viene mantenuto il file
originale come variante grande. Le immagini animate vengono escluse.

`SiteImage` usa `srcset` e gli attributi `sizes` già presenti nelle pagine per
lasciare al browser la scelta in base a spazio e densità dello schermo. Mantiene
alt, dimensioni, classi, caricamento differito e preload delle immagini prioritarie.
Le immagini Sanity continuano a essere ridimensionate dal loro CDN. Loghi,
animazioni, layout e contenuti non cambiano.

## Build e aggiornamenti

Le configurazioni Next.js e Vite chiamano automaticamente il generatore prima
della compilazione, anche con `next build` diretto su Vercel. Non serve cambiare
il comando di build del progetto. `sharp` è una dipendenza esplicita e bloccata
alla versione già presente nel lockfile.

`public/optimized-media` e `lib/local-image-manifest.json` sono generati e ignorati
da Git. I nomi delle copie contengono l'hash dei contenuti e delle impostazioni,
così sostituire una foto produce URL nuovi. Per rigenerarle manualmente prima
di un controllo TypeScript isolato: `npm run images:prepare`.

## Misure sui file

Confronto tra originali e copie da 768 px (KB decimali, arrotondati):

| Immagine | Originale | WebP 768 px | Riduzione |
| --- | ---: | ---: | ---: |
| Poster home | 368 KB | 146 KB | 60% |
| Open Days | 173 KB | 54 KB | 69% |
| Festival recap | 101 KB | 42 KB | 59% |

Il risparmio effettivo dipende dalla variante selezionata dal browser. Questi
valori misurano i file e non sono nuovi risultati PageSpeed.
