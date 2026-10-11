import { defineField, defineType } from "sanity";

export default defineType({
  name: "siteSettings", title: "Impostazioni sito", type: "document",
  fields: [
    defineField({
      name: "shopOnly", title: "Modalità temporanea: solo shop", type: "boolean", initialValue: true,
      description: "Attiva: home dedicata al cartaceo, menu ridotto e sezioni editoriali nascoste anche dai link diretti. Disattiva e pubblica per ripristinare tutto il sito; lo Shop rimane nel menu. I documenti esistenti senza questo campo partono in modalità shop.",
    }),
    defineField({
      name: "featuredMagazine", title: "Cartaceo in evidenza nello shop", type: "reference", to: [{ type: "magazine" }],
      description: "In modalità temporanea compare solo questo cartaceo. Se non selezionato, viene cercato il volume 4 pubblicato. Foto e link sono gestiti nel documento Cartaceo.",
    }),
    defineField({ name: "title", title: "Nome sito", type: "string", validation: (rule) => rule.required() }),
    defineField({ name: "description", title: "Descrizione", type: "text", rows: 3 }),
    defineField({ name: "email", title: "Email", type: "string", validation: (rule) => rule.required().email() }),
    defineField({ name: "instagramHandle", title: "Nome Instagram", type: "string" }),
    defineField({ name: "instagramUrl", title: "Link Instagram", type: "url" }),
    defineField({
      name: "metrics", title: "Numeri", type: "array", validation: (rule) => rule.max(3), of: [{
        type: "object", fields: [
          defineField({ name: "value", title: "Valore", type: "string" }),
          defineField({ name: "label", title: "Etichetta", type: "string" }),
        ],
      }],
    }),
  ],
});
