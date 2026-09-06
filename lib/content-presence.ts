import type { RichText } from "@/types/content";

/** An optional Sanity field can be absent, null, or contain only whitespace. */
export function hasText(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export function contentText(value: unknown): string {
  return hasText(value) ? value.trim() : "";
}

/** Keep span spacing and formatting intact; discard only empty paragraphs. */
export function richTextBlocks(value: RichText | null | undefined): RichText {
  return (value ?? []).filter((block) =>
    typeof block === "string"
      ? hasText(block)
      : block?._type === "block" && block.children?.some((span) => hasText(span?.text)),
  );
}
