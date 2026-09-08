import { defineField, defineType } from "sanity";

export default defineType({
  name: "subscriber", title: "Iscritto newsletter (archivio storico)", type: "document",
  description: "Sola lettura: le nuove iscrizioni vanno su Brevo. Qui restano quelle raccolte prima della migrazione; nessuna importazione o cancellazione automatica.",
  fields: [
    defineField({ name: "email", title: "Email", type: "string", readOnly: true }),
    defineField({ name: "subscribedAt", title: "Data iscrizione", type: "datetime", readOnly: true }),
    defineField({ name: "consentAt", title: "Consenso espresso il", type: "datetime", readOnly: true }),
    defineField({ name: "active", title: "Attivo", type: "boolean", initialValue: true }),
  ],
  preview: { select: { title: "email", subtitle: "subscribedAt" } },
});
