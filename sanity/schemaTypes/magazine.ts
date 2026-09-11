import { defineField, defineType } from "sanity";

type MagazineDraft = { comingSoon?: boolean; releaseAt?: string };

export default defineType({
  name: "magazine", title: "Cartaceo digitale", type: "document",
  fields: [
    defineField({ name: "title", title: "Titolo", type: "string", validation: (rule) => rule.required() }),
    defineField({ name: "volume", title: "Volume", type: "number", validation: (rule) => rule.required().integer() }),
    defineField({ name: "coverImage", title: "Copertina", type: "image", validation: (rule) => rule.required() }),
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
