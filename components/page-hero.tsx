import { DynamicTitle } from "@/components/dynamic-title";
import { hasText } from "@/lib/content-presence";

export function PageHero({ kicker, title, intro }: { kicker?: string; title: string; intro?: string }) {
  return (
    <section className="page-hero shell">
      {hasText(kicker) ? <span className="eyebrow">{kicker}</span> : null}
      <DynamicTitle as="h1" lines={[title]} eager />
      {hasText(intro) ? <p>{intro}</p> : null}
    </section>
  );
}
