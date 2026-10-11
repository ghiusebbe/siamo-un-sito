import { Shop } from "@/components/shop";
import { getSiteSettings } from "@/lib/content";
import { isShopOnly } from "@/lib/shop";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("/shop", "Shop", "I cartacei di SIAMO: scopri e acquista i numeri del magazine.");

export default async function ShopPage() {
  const settings = await getSiteSettings();
  return <Shop settings={settings} featuredOnly={isShopOnly(settings)} />;
}
