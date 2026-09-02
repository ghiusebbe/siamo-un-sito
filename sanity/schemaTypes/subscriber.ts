import { defineField, defineType } from "sanity";

export default defineType({
  name: "subscriber", title: "Iscritto newsletter", type: "document",
  fields: [
    defineField({ name: "email", title: "Email", type: "string", readOnly: true }),
    defineField({ name: "subscribedAt", title: "Data iscrizione", type: "datetime", readOnly: true }),
    defineField({ name: "active", title: "Attivo", type: "boolean", initialValue: true }),
  ],
  preview: { select: { title: "email", subtitle: "subscribedAt" } },
});
