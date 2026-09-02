import { defineField, defineType } from "sanity";

export default defineType({
  name: "timelineItem", title: "Timeline", type: "document",
  fields: [
    defineField({ name: "title", title: "Titolo", type: "string", validation: (rule) => rule.required() }),
    defineField({ name: "year", title: "Anno", type: "number", validation: (rule) => rule.required().integer().min(2000).max(2100) }),
    defineField({ name: "order", title: "Ordine nello stesso anno", type: "number", initialValue: 0 }),
    defineField({ name: "description", title: "Descrizione", type: "text", rows: 3 }),
    defineField({ name: "image", title: "Immagine", type: "image", options: { hotspot: true } }),
  ],
  preview: { select: { title: "title", subtitle: "year", media: "image" } },
});
