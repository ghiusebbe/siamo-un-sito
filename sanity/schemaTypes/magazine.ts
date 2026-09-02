import { defineField, defineType } from "sanity";

export default defineType({
  name: "magazine", title: "Cartaceo digitale", type: "document",
  fields: [
    defineField({ name: "title", title: "Titolo", type: "string", validation: (rule) => rule.required() }),
    defineField({ name: "volume", title: "Volume", type: "number", validation: (rule) => rule.required().integer() }),
    defineField({ name: "coverImage", title: "Copertina", type: "image", validation: (rule) => rule.required() }),
    defineField({ name: "checkoutUrl", title: "Link acquisto", type: "url", validation: (rule) => rule.required() }),
  ],
  preview: { select: { title: "title", subtitle: "volume", media: "coverImage" } },
});
