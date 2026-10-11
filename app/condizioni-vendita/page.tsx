import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/page-hero";
import { getSiteSettings } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata(
  "/condizioni-vendita",
  "Condizioni di vendita",
  "Condizioni per acquistare i cartacei SIAMO: pagamento con Stripe, preordini, consegna, assistenza e garanzia legale.",
);

const UPDATED_AT = "11 ottobre 2026";

export default async function SalesTermsPage() {
  const settings = await getSiteSettings();

  return (
    <>
      <PageHero
        kicker="Informazioni per l’acquisto"
        title="CONDIZIONI DI VENDITA"
        intro="Le condizioni per acquistare un numero cartaceo di SIAMO, anche in preordine."
      />
      <div className="editorial-body prose">
        <h2>1. Chi vende</h2>
        <p>
          Il venditore è <strong>SIAMO</strong>, associazione non riconosciuta con sede in Via Michele Schina 7,
          10143 Torino (TO), codice fiscale 97928370010, in persona del legale rappresentante pro tempore.
          Per informazioni, assistenza o reclami scrivi a{" "}
          <a href={`mailto:${settings.email}`}>{settings.email}</a>. Stripe gestisce il pagamento;
          SIAMO rimane il venditore e il referente per l’ordine e la consegna.
        </p>

        <h2>2. Cosa acquisti</h2>
        <p>
          Queste condizioni riguardano la vendita online di <strong>singoli numeri cartacei della rivista SIAMO</strong>
          {" "}a consumatori. Non si tratta di un abbonamento e non sono previsti rinnovi o addebiti periodici.
          Numero, caratteristiche e disponibilità sono indicati nella scheda del prodotto e nel checkout.
          Le immagini presentano la pubblicazione; lievi differenze di resa cromatica tra schermo e stampa
          non modificano le caratteristiche descritte né limitano la garanzia legale.
        </p>

        <h2>3. Prezzo e spese</h2>
        <p>
          I prezzi sono espressi in euro. Prima della conferma del pagamento il checkout mostra il prezzo
          del prodotto, le imposte applicabili, le eventuali spese di spedizione e il totale dovuto.
          Puoi verificare quantità, destinazione e importo e correggere i dati prima di pagare.
          Nessun costo aggiuntivo viene applicato senza essere indicato e accettato prima dell’ordine.
          Le destinazioni disponibili e le relative tariffe sono quelle abilitate nel checkout.
        </p>

        <h2>4. Ordine e pagamento con Stripe</h2>
        <p>
          Il pulsante di acquisto o preordine apre il checkout di Stripe. Il contratto si conclude quando
          confermi l’ordine con obbligo di pagamento e il pagamento va a buon fine. Per i metodi di pagamento
          differiti, l’ordine resta in attesa fino alla conferma dell’esito positivo; un tentativo fallito
          non costituisce un acquisto completato. I metodi disponibili sono mostrati nel checkout.
        </p>
        <p>
          Riceverai all’indirizzo email indicato la conferma dell’ordine con il riepilogo del prodotto,
          dell’importo, dei dati di consegna e dei tempi concordati, insieme a una copia delle condizioni
          applicabili che puoi conservare. Se non ricevi la conferma o noti un errore, contattaci prima di
          ripetere il pagamento. La ricevuta di pagamento Stripe non sostituisce l’eventuale documento
          fiscale previsto dalla normativa applicabile.
        </p>

        <h2>5. Preordini</h2>
        <p>
          Se il numero è in preordine, il pagamento viene richiesto al momento dell’ordine e la consegna
          avverrà nei tempi indicati nella scheda del prodotto e nel checkout prima del pagamento.
          La scadenza dei preordini e la data di uscita della rivista non coincidono necessariamente con
          la data di spedizione o consegna. Un termine diverso da quello ordinario deve essere concordato
          prima dell’acquisto.
        </p>
        <p>
          Se un numero già pagato risulta indisponibile o il preordine viene annullato da SIAMO,
          ti informeremo e rimborseremo tutte le somme versate per quell’ordine, incluse le spese di
          spedizione. Non sostituiremo il prodotto con un altro senza il tuo accordo.
        </p>

        <h2>6. Spedizione e consegna</h2>
        <p>
          Per spedire servono il nome del destinatario, un indirizzo completo e un contatto email.
          Il numero di telefono viene richiesto solo se necessario alla consegna. Controlla i dati
          nel checkout; per correggerli dopo l’ordine scrivici subito. Una modifica potrebbe non essere
          possibile se il pacco è già stato affidato al vettore.
        </p>
        <p>
          La consegna avviene entro il termine comunicato prima del pagamento. Se non è stato concordato
          un termine diverso, deve avvenire senza ritardo ingiustificato e comunque entro 30 giorni dalla
          conclusione del contratto. In caso di ritardo puoi chiedere la consegna entro un termine
          supplementare appropriato e, se non viene rispettato, risolvere il contratto e ottenere il rimborso.
          Non occorre un termine supplementare nei casi previsti dalla legge, tra cui il rifiuto di consegnare
          o il mancato rispetto di una data essenziale concordata.
        </p>
        <p>
          Il rischio di perdita o danneggiamento durante il trasporto resta a carico di SIAMO fino a quando
          tu, o una persona da te designata diversa dal vettore, ricevi materialmente il cartaceo.
          Per pacchi mancanti o copie danneggiate contattaci: non devi rivolgerti esclusivamente al corriere.
        </p>

        <h2>7. Recesso per ripensamento</h2>
        <p>
          Per la fornitura di singoli numeri di giornali, periodici e riviste il diritto di recesso per
          ripensamento è escluso dall’<strong>art. 59, comma 1, lettera l), del Codice del consumo</strong>.
          Questa esclusione si applica ai singoli numeri della rivista venduti nello shop, anche in preordine;
          non si estende agli abbonamenti, che non sono oggetto di queste condizioni.
          Non è quindi previsto il reso per il solo ripensamento dopo l’acquisto.
        </p>
        <p>
          L’esclusione del recesso <strong>non limita i tuoi diritti</strong> in caso di difetti, prodotto
          diverso da quello ordinato, mancata consegna o annullamento dell’ordine da parte di SIAMO.
        </p>

        <h2>8. Garanzia e assistenza</h2>
        <p>
          Si applica la garanzia legale di conformità prevista dal Codice del consumo: SIAMO risponde dei
          difetti presenti alla consegna che si manifestano entro due anni dalla stessa.
          In presenza di un difetto hai diritto al ripristino della conformità senza spese, tramite
          riparazione o sostituzione nei limiti previsti dalla legge; nei casi previsti puoi ottenere
          la riduzione del prezzo o la risoluzione del contratto con rimborso.
        </p>
        <p>
          Scrivi a <a href={`mailto:${settings.email}`}>{settings.email}</a> indicando il riferimento
          dell’ordine e il problema riscontrato. Se possibile allega foto della copia o del pacco per
          aiutarci a verificare il caso: non sono una condizione per esercitare i diritti di legge.
          Ti comunicheremo come procedere con l’eventuale restituzione; i costi dei rimedi in garanzia
          sono a nostro carico. I rimborsi dovuti vengono effettuati senza ritardo ingiustificato,
          di regola sul mezzo di pagamento utilizzato, senza costi per il consumatore.
        </p>

        <h2>9. Dati personali</h2>
        <p>
          I dati dell’ordine sono utilizzati per pagamento, consegna, assistenza e obblighi di legge.
          L’acquisto non comporta l’iscrizione automatica alla newsletter.
          Per finalità, destinatari e diritti consulta l’<Link href="/privacy">informativa privacy</Link>.
        </p>

        <h2>10. Legge applicabile e controversie</h2>
        <p>
          Si applica la legge italiana, senza privarti delle tutele inderogabili riconosciute dalla
          normativa del Paese in cui risiedi abitualmente. Per le controversie con consumatori è competente
          il giudice del luogo di residenza o domicilio del consumatore, ove previsto dalla legge.
          Puoi inviarci un reclamo all’email indicata sopra; resta sempre possibile esercitare i tuoi diritti
          nelle sedi competenti.
        </p>

        <h2>11. Versione delle condizioni</h2>
        <p>
          A ogni ordine si applicano le condizioni disponibili al momento dell’acquisto. Eventuali
          aggiornamenti non modificano gli ordini già conclusi. Ultimo aggiornamento: {UPDATED_AT}.
        </p>
        <p><Link className="back-link" href="/shop">← Torna allo shop</Link></p>
      </div>
    </>
  );
}
