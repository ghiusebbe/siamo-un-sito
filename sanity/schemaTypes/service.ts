import { defineField, defineType } from "sanity";

export default defineType({
  name: "service",
  title: "Servizio",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Nome", type: "string", validation: (rule) => rule.required() }),
    defineField({ name: "slug", title: "URL", type: "slug", options: { source: "title" }, validation: (rule) => rule.required() }),
    defineField({ name: "order", title: "Ordine", type: "number", initialValue: 0 }),
    defineField({ name: "tagline", title: "Tagline", type: "string", validation: (rule) => rule.required() }),
    defineField({ name: "intro", title: "Introduzione", type: "text", rows: 5, validation: (rule) => rule.required() }),
    defineField({ name: "coverImage", title: "Immagine principale", type: "image", options: { hotspot: true } }),
    defineField({ name: "gallery", title: "Galleria", type: "array", of: [{ type: "image", options: { hotspot: true } }] }),
    defineField({
      name: "deliverables", title: "Cosa facciamo", type: "array", of: [{
        type: "object", fields: [
          defineField({ name: "title", title: "Titolo", type: "string", validation: (rule) => rule.required() }),
          defineField({ name: "description", title: "Descrizione", type: "text", rows: 3 }),
        ],
      }],
    }),
    defineField({
      name: "faq", title: "FAQ", type: "array", of: [{
        type: "object", fields: [
          defineField({ name: "question", title: "Domanda", type: "string", validation: (rule) => rule.required() }),
          defineField({ name: "answer", title: "Risposta", type: "text", rows: 4 }),
        ],
      }],
    }),
  ],
  preview: { select: { title: "title", subtitle: "tagline", media: "coverImage" } },
});
