/** One editorial origin, including builds made on preview or legacy hosts. */
export const siteUrl = "https://siamounmagazine.com";

export function canonicalUrl(path = "/"): string {
  return new URL(path, siteUrl).toString();
}
