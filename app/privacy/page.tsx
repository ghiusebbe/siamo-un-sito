import type { Metadata } from "next";
import Link from "next/link";
import { ConsentLink } from "@/components/consent-link";
import { PageHero } from "@/components/page-hero";
import { getSiteSettings } from "@/lib/content";

export const metadata: Metadata = {
  title: "Privacy e cookie",
  description: "Come SIAMO tratta i dati personali di chi visita il sito e si iscrive alla newsletter.",
};

const UPDATED_AT = "settembre 2026";

export default async function PrivacyPage() {
  const settings = await getSiteSettings();

  return (
    <>
      <PageHero
        kicker="Informativa"
        title="PRIVACY E COOKIE"
        intro="Quali dati raccoglie questo sito, perché, per quanto tempo e come puoi intervenire."
      />
      <div className="editorial-body prose">
        <p className="policy-note">
          Da completare prima della pubblicazione: ragione sociale, sede legale e partita IVA del titolare del
          trattamento, e l’elenco definitivo dei cookie rilasciato dal fornitore del messaggio di consenso.
        </p>

        <h2>Titolare del trattamento</h2>
        <p>
          Il titolare è <strong>SIAMO</strong> — <em>[ragione sociale, sede legale e partita IVA]</em>. Per qualsiasi
          richiesta relativa ai tuoi dati scrivi a <a href={`mailto:${settings.email}`}>{settings.email}</a>.
        </p>

        <h2>Dati raccolti</h2>
        <h3>Iscrizione alla newsletter</h3>
        <p>
          Quando ti iscrivi raccogliamo il tuo <strong>indirizzo email</strong>, la <strong>data del consenso</strong> e
          il consenso stesso. Servono solo a inviarti la newsletter di SIAMO: la base giuridica è il tuo consenso
          (art. 6.1.a GDPR), che puoi revocare in qualsiasi momento scrivendo all’indirizzo qui sopra. Conserviamo i
          dati finché resti iscritto; alla revoca vengono cancellati.
        </p>
        <h3>Navigazione</h3>
        <p>
          Il fornitore di hosting registra automaticamente i dati tecnici che ogni browser invia — indirizzo IP,
          pagina richiesta, data e ora, tipo di browser — per erogare il servizio e proteggerlo da abusi
          (legittimo interesse, art. 6.1.f GDPR). Sono log tecnici, non li usiamo per profilarti.
        </p>
        <h3>Pubblicità</h3>
        <p>
          Le pagine degli articoli possono ospitare fino a due spazi pubblicitari serviti da Google (Ad Manager e
          AdSense). Se acconsenti, Google e i suoi partner leggono e scrivono cookie o identificatori simili per
          selezionare e misurare gli annunci, anche in forma personalizzata. Senza consenso non vengono richiesti
          annunci personalizzati.
        </p>

        <h2>Cookie</h2>
        <p>
          Il sito usa cookie tecnici necessari al funzionamento, che non richiedono consenso, e memorizza nel browser
          una preferenza di sessione per non ripetere l’animazione d’ingresso. I cookie pubblicitari e di misurazione
          di Google vengono attivati soltanto dopo la tua scelta nel messaggio di consenso.
        </p>
        <p>Puoi modificare o revocare la scelta in qualsiasi momento:</p>
        <p><ConsentLink /></p>

        <h2>A chi comunichiamo i dati</h2>
        <p>
          Ci appoggiamo a fornitori che trattano i dati per nostro conto: <strong>Sanity</strong> (gestione dei
          contenuti e archivio delle iscrizioni alla newsletter), il fornitore di <strong>hosting</strong> del sito e{" "}
          <strong>Google</strong> per la pubblicità. Gli acquisti del cartaceo avvengono sulla piattaforma di
          pagamento esterna collegata dai pulsanti d’acquisto, che tratta i dati come titolare autonomo. Alcuni
          fornitori hanno sede fuori dall’Unione Europea: in quel caso il trasferimento avviene sulla base delle
          clausole contrattuali standard approvate dalla Commissione Europea.
        </p>
        <p>Non vendiamo i tuoi dati e non li comunichiamo a nessun altro se non per obbligo di legge.</p>

        <h2>I tuoi diritti</h2>
        <p>
          Puoi chiedere in ogni momento accesso, rettifica, cancellazione, limitazione o portabilità dei tuoi dati, e
          opporti al trattamento fondato sul legittimo interesse (artt. 15-22 GDPR). Scrivi a{" "}
          <a href={`mailto:${settings.email}`}>{settings.email}</a>: rispondiamo entro un mese. Se ritieni che il
          trattamento violi il Regolamento puoi rivolgerti al{" "}
          <a href="https://www.garanteprivacy.it" target="_blank" rel="noreferrer">Garante per la protezione dei dati personali ↗</a>.
        </p>

        <h2>Modifiche</h2>
        <p>
          Se cambiamo il modo in cui trattiamo i dati aggiorniamo questa pagina e la data qui sotto. Ultimo
          aggiornamento: {UPDATED_AT}.
        </p>
        <p><Link className="back-link" href="/">← Torna alla home</Link></p>
      </div>
    </>
  );
}
