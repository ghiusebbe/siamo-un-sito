import { defineField, defineType } from "sanity";

export default defineType({
  name: "article",
  title: "Articolo",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Titolo", type: "string", validation: (rule) => rule.required() }),
    defineField({ name: "slug", title: "URL", type: "slug", options: { source: "title", maxLength: 96 }, validation: (rule) => rule.required() }),
    defineField({ name: "category", title: "Categoria", type: "string", validation: (rule) => rule.required() }),
    defineField({ name: "subtitle", title: "Sottotitolo", type: "string" }),
    defineField({ name: "excerpt", title: "Anteprima", type: "text", rows: 3, validation: (rule) => rule.max(240) }),
    defineField({ name: "coverImage", title: "Copertina", type: "image", options: { hotspot: true }, validation: (rule) => rule.required() }),
    defineField({ name: "author", title: "Autore", type: "string", validation: (rule) => rule.required() }),
    defineField({ name: "publishedAt", title: "Data di pubblicazione", type: "datetime", validation: (rule) => rule.required() }),
    defineField({ name: "featured", title: "In evidenza", type: "boolean", initialValue: false }),
    defineField({
      name: "body", title: "Contenuto", type: "array",
      of: [
        { type: "block", styles: [{ title: "Normale", value: "normal" }, { title: "Titolo 2", value: "h2" }, { title: "Titolo 3", value: "h3" }, { title: "Citazione", value: "blockquote" }] },
      ],
    }),
  ],
  orderings: [{ title: "Più recenti", name: "publishedAtDesc", by: [{ field: "publishedAt", direction: "desc" }] }],
  preview: { select: { title: "title", subtitle: "category", media: "coverImage" } },
});
