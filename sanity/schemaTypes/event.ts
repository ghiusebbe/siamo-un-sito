import { defineField, defineType } from "sanity";

export default defineType({
  name: "event",
  title: "Evento",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Nome evento", type: "string", validation: (rule) => rule.required() }),
    defineField({ name: "slug", title: "URL", type: "slug", options: { source: "title" }, validation: (rule) => rule.required() }),
    defineField({ name: "date", title: "Data e ora", type: "datetime", validation: (rule) => rule.required() }),
    defineField({ name: "venue", title: "Venue", type: "string" }),
    defineField({ name: "city", title: "Città", type: "string" }),
    defineField({ name: "lineup", title: "Lineup", type: "array", of: [{ type: "string" }] }),
    defineField({ name: "coverImage", title: "Locandina", type: "image", options: { hotspot: true }, validation: (rule) => rule.required() }),
    defineField({ name: "ticketUrl", title: "Link biglietti", type: "url" }),
    defineField({ name: "status", title: "Stato", type: "string", options: { list: [{ title: "Prossimamente", value: "upcoming" }, { title: "Archivio", value: "archived" }], layout: "radio" }, initialValue: "upcoming" }),
    defineField({ name: "description", title: "Descrizione", type: "array", of: [{ type: "block" }] }),
  ],
  preview: { select: { title: "title", subtitle: "date", media: "coverImage" } },
});
