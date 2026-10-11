import { EditorialHome } from "@/components/editorial-home";
import { Shop } from "@/components/shop";
import { getSiteSettings } from "@/lib/content";
import { isShopOnly } from "@/lib/shop";
import { homeTitle, pageMetadata, siteDescription } from "@/lib/seo";

export async function generateMetadata() {
  const settings = await getSiteSettings();
  return isShopOnly(settings)
    ? pageMetadata("/", "Shop", "I cartacei di SIAMO: scopri e acquista il nuovo numero del magazine.")
    : { ...pageMetadata("/", homeTitle, siteDescription), title: { absolute: homeTitle } };
}

export default async function HomePage() {
  const settings = await getSiteSettings();
  return isShopOnly(settings) ? <Shop settings={settings} featuredOnly /> : <EditorialHome />;
}
