import { defineField, defineType } from "sanity";

type MagazineDraft = { comingSoon?: boolean; releaseAt?: string };

export default defineType({
  name: "magazine", title: "Cartaceo / Shop", type: "document",
  fields: [
    defineField({ name: "title", title: "Titolo", type: "string", validation: (rule) => rule.required() }),
    defineField({ name: "volume", title: "Volume", type: "number", validation: (rule) => rule.required().integer() }),
    defineField({ name: "coverImage", title: "Copertina", type: "image", validation: (rule) => rule.required() }),
    defineField({ name: "productImage", title: "Foto per lo shop", type: "image", description: "Facoltativa: foto del cartaceo o mockup. Se assente, lo shop usa la copertina intera, senza ritagliarla." }),
    defineField({ name: "description", title: "Descrizione per lo shop", type: "text", rows: 3 }),
    defineField({ name: "price", title: "Prezzo in euro", type: "number", validation: (rule) => rule.min(0).precision(2) }),
    defineField({ name: "shippingNote", title: "Nota spedizione", type: "string", description: "Per esempio: Spedizione calcolata al pagamento. Mostrata accanto al pulsante." }),
    defineField({ name: "preorderUntil", title: "Preordini fino al", type: "date", description: "Fino a questa data inclusa (ora italiana) il pulsante dice Preordina; dopo torna Acquista. Il termine non imposta una data di spedizione." }),
    defineField({
      name: "comingSoon", title: "Coming Soon", type: "boolean", initialValue: false,
      description: "Mostra «Coming soon» al posto del pulsante Acquista. Il link d’acquisto non viene pubblicato sul sito.",
    }),
    defineField({
      name: "releaseAt", title: "Uscita (timer facoltativo)", type: "datetime",
      description: "Mostra un conto alla rovescia. Alla scadenza il pulsante Acquista compare da solo, se il link è compilato (entro qualche minuto, per la cache del sito).",
      options: { timeStep: 15 },
      hidden: ({ document }) => !(document as MagazineDraft | undefined)?.comingSoon,
    }),
    defineField({
      name: "checkoutUrl", title: "Link acquisto", type: "url",
      validation: (rule) => [
        rule.uri({ scheme: ["https"] }),
        rule.custom((value, { document }) => value || (document as MagazineDraft | undefined)?.comingSoon
          ? true
          : "Inserisci il link d’acquisto oppure attiva Coming Soon."),
        rule.custom((value, { document }) => {
          const draft = document as MagazineDraft | undefined;
          return !value && draft?.comingSoon && draft.releaseAt
            ? "Senza link, alla scadenza del timer non comparirà nessun pulsante Acquista."
            : true;
        }).warning(),
      ],
    }),
  ],
  preview: {
    select: { title: "title", volume: "volume", comingSoon: "comingSoon", media: "coverImage" },
    prepare: ({ title, volume, comingSoon, media }) => ({
      title, media, subtitle: `Volume ${volume ?? "?"}${comingSoon ? " · Coming soon" : ""}`,
    }),
  },
});
