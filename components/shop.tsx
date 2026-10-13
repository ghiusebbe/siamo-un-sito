import Image from "@/components/site-image";
import { NewTabNote } from "@/components/new-tab-note";
import { TrackedLink } from "@/components/tracked-link";
import { getShopMagazines } from "@/lib/content";
import { magazineOffer } from "@/lib/magazine";
import { shopPurchase } from "@/lib/shop";
import type { SiteSettings } from "@/types/content";

export async function Shop({ settings, featuredOnly = false }: { settings: SiteSettings; featuredOnly?: boolean }) {
  const magazines = await getShopMagazines(settings, featuredOnly);
  // A reference selects one product; the default selects the newest published vol. 4.
  const products = featuredOnly ? magazines.slice(0, 1) : magazines;
  // Server-only: a single request-time clock drives both release and preorder status.
  // eslint-disable-next-line react-hooks/purity
  const now = Date.now();

  return (
    <section className="shop shell" aria-labelledby="shop-title">
      <div className="shop-heading">
        <h1 id="shop-title">SHOP.</h1>
        <span className="eyebrow">SIAMO un magazine · Cartacei</span>
      </div>
      {products.length ? products.map((magazine, index) => {
        const image = magazine.productImage || magazine.cover;
        const offer = magazineOffer(magazine, now);
        const purchase = shopPurchase(magazine, now);
        // CMS validation is also enforced at render time for pre-existing documents.
        const checkout = offer.kind === "buy" && /^https:\/\//i.test(offer.url) ? offer.url : undefined;
        return (
          <article className="shop-product" key={magazine.id} aria-labelledby={`product-${index}`}>
            <div className={`shop-image${magazine.productImage ? " shop-image-photo" : ""}`}>
              {image ? <Image src={image} alt={`${magazine.productImage ? "Foto del cartaceo" : "Copertina"} di ${magazine.title}, volume ${magazine.volume}`} width={1086} height={1536} sizes="(max-width: 760px) calc(100vw - 28px), (max-width: 1220px) 46vw, 560px" priority={index === 0} />
                : <p className="shop-image-empty">Immagine in arrivo.</p>}
            </div>
            <div className="shop-copy">
              <span className={`eyebrow${checkout && purchase.preorder ? " shop-status" : ""}`}>
                {checkout && purchase.preorder ? "Preordini aperti" : `Il cartaceo · Vol. ${magazine.volume}`}
              </span>
              <h2 id={`product-${index}`}>SIAMO<br />VOL. {magazine.volume}</h2>
              {magazine.title && <p className="shop-product-title">{magazine.title}</p>}
              {magazine.description && <p className="shop-description">{magazine.description}</p>}
              {magazine.price !== undefined && <p className="shop-price">{new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(magazine.price)}</p>}
              <div className="shop-purchase">
                {checkout ? <>
                  {purchase.deadline && <p className="shop-deadline">Preordini fino al {purchase.deadline}.</p>}
                  <TrackedLink className="shop-buy" href={checkout} target="_blank" rel="noopener noreferrer" event="Acquista" properties={{ volume: magazine.volume, origine: "shop" }}>
                    <span>{purchase.label}</span>
                    <svg className="shop-buy-arrow" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
                      <path d="M5 19 19 5M5 5h14v14" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <NewTabNote />
                  </TrackedLink>
                </> : <p className="shop-availability" role="status">{offer.kind === "coming-soon" ? "Disponibile prossimamente." : "Acquisto disponibile a breve."}</p>}
                {magazine.shippingNote && <p className="shop-shipping">{magazine.shippingNote}</p>}
              </div>
            </div>
          </article>
        );
      }) : <p className="shop-empty" role="status">Il nuovo cartaceo sarà disponibile a breve.</p>}
    </section>
  );
}
