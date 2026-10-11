import { pageMetadata } from "@/lib/seo";
import type { Metadata } from "next";
import Link from "next/link";
import { ConsentLink } from "@/components/consent-link";
import { PageHero } from "@/components/page-hero";
import { getSiteSettings } from "@/lib/content";

export const metadata: Metadata = pageMetadata("/privacy", "Privacy e cookie", "Come SIAMO tratta i dati personali per navigazione, newsletter, acquisto del cartaceo e spedizione tramite checkout Stripe.");

const UPDATED_AT = "11 ottobre 2026";

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
        <h2>Titolare del trattamento</h2>
        <p>
          Il titolare è <strong>SIAMO</strong>, associazione non riconosciuta con sede in Via Michele Schina 7,
          10143 Torino (TO), codice fiscale 97928370010, in persona del legale rappresentante pro tempore. Per
          qualsiasi richiesta relativa ai tuoi dati scrivi a <a href={`mailto:${settings.email}`}>{settings.email}</a>.
        </p>

        <h2>Dati raccolti</h2>
        <h3>Acquisto e spedizione del cartaceo</h3>
        <p>
          Quando acquisti tramite il checkout <strong>Stripe</strong>, trattiamo nome, email, indirizzo di
          spedizione, prodotti e quantità acquistati, importo, riferimento e stato del pagamento.
          Il telefono è richiesto solo se necessario per la consegna; eventuali dati di fatturazione servono
          agli adempimenti fiscali applicabili. I dati necessari all’ordine sono richiesti per poterlo
          eseguire: senza di essi non possiamo completare il pagamento o spedire.
          La base giuridica è l’esecuzione del contratto (art. 6.1.b GDPR) e, per gli adempimenti contabili
          e fiscali, l’obbligo di legge (art. 6.1.c GDPR).
        </p>
        <p>
          Stripe raccoglie direttamente i dati del mezzo di pagamento: SIAMO non riceve il numero completo
          della carta né il suo codice di sicurezza. Accediamo ai dati necessari dell’ordine tramite Stripe
          per gestire consegna, assistenza ed eventuali rimborsi; i dati degli acquirenti e gli indirizzi
          di spedizione non vengono salvati nel CMS Sanity. L’acquisto non ti iscrive alla newsletter e
          non utilizziamo i dati dell’ordine per inviarti promozioni senza un consenso separato.
        </p>
        <p>
          Conserviamo i dati operativi per il tempo necessario a eseguire l’ordine e gestire assistenza
          e garanzia. Successivamente manteniamo solo i dati richiesti dagli obblighi contabili e fiscali
          per i termini di legge o necessari a tutelare i nostri diritti fino alla scadenza dei termini
          applicabili (legittimo interesse, art. 6.1.f GDPR); in caso di controversia, fino alla sua definizione.
          Gli indirizzi destinati alla sola spedizione non sono conservati per finalità promozionali.
        </p>
        <h3>Iscrizione alla newsletter</h3>
        <p>
          Quando ti iscrivi raccogliamo il tuo <strong>indirizzo email</strong>, la <strong>data del consenso</strong> e
          il consenso stesso. Servono solo a inviarti la newsletter di SIAMO: la base giuridica è il tuo consenso
          (art. 6.1.a GDPR), che puoi revocare in qualsiasi momento dal link di cancellazione presente in fondo a
          ogni numero o scrivendo all’indirizzo qui sopra. L’elenco degli iscritti e le statistiche di apertura sono
          gestiti da <strong>Brevo</strong>, la piattaforma con cui inviamo la newsletter. Conserviamo i dati
          finché resti iscritto; dopo la disiscrizione resta registrato lo stato di esclusione dagli invii.
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
          I dati sono accessibili alle persone autorizzate di SIAMO e ai fornitori coinvolti nel servizio:
          <strong> Brevo</strong> per la newsletter, il fornitore di <strong>hosting</strong> per il sito,
          <strong> Google</strong> per la pubblicità ove attiva e <strong>Stripe</strong> per i pagamenti.
          I vettori ricevono i dati necessari a consegnare il cartaceo; eventuali consulenti contabili
          ricevono quelli necessari agli adempimenti di legge. Sanity gestisce i contenuti editoriali
          e le immagini dello shop, non gli ordini e gli indirizzi degli acquirenti.
        </p>
        <p>
          Stripe agisce come responsabile del trattamento per le attività svolte per nostro conto e come
          titolare autonomo per proprie finalità, tra cui obblighi normativi e prevenzione delle frodi.
          Per i suoi trattamenti consulta l’<a href="https://stripe.com/it/privacy" target="_blank" rel="noreferrer">informativa privacy di Stripe ↗</a>.
          I servizi dei fornitori possono comportare trasferimenti fuori dallo Spazio economico europeo,
          soggetti alle garanzie previste dal GDPR, quali decisioni di adeguatezza o clausole contrattuali
          standard ove applicabili. Puoi chiedere informazioni sulle garanzie utilizzate scrivendoci.
        </p>
        <p>Non vendiamo i tuoi dati. Li comunichiamo nei limiti necessari alle finalità descritte o per obbligo di legge.</p>

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
        <p>Per gli acquisti consulta anche le <Link href="/condizioni-vendita">condizioni di vendita</Link>.</p>
        <p><Link className="back-link" href="/">← Torna alla home</Link></p>
      </div>
    </>
  );
}
