import { defineField, defineType } from "sanity";

export default defineType({
  name: "siteSettings", title: "Impostazioni sito", type: "document",
  fields: [
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
