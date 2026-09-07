export function formatDate(date: string) {
  return new Intl.DateTimeFormat("it-IT", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

/**
 * Longest whitespace-separated token of a title. Editorial headings are set at
 * sizes that only the container can bound: a title may wrap between words, but
 * a single word never can, so this is what decides the largest size that fits.
 * Feeds `--title-chars`, read by the `--title-fit` ceiling in globals.css.
 */
export function longestWordLength(title: string) {
  return title.split(/\s+/).reduce((longest, word) => Math.max(longest, word.length), 0);
}
