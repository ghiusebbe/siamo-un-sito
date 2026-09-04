import { Fragment, type ReactNode } from "react";
import { NewTabNote } from "@/components/new-tab-note";
import type { PortableBlock, PortableSpan, RichText } from "@/types/content";

type RichTextContentProps = {
  inlineContent?: ReactNode;
  value: RichText;
};

const minimumBlocksForInlineContent = 5;
const inlineContentIndex = 2;

const decorators: Record<string, (children: ReactNode) => ReactNode> = {
  strong: (children) => <strong>{children}</strong>,
  em: (children) => <em>{children}</em>,
  underline: (children) => <u>{children}</u>,
  "strike-through": (children) => <s>{children}</s>,
  code: (children) => <code>{children}</code>,
};

/** Anything that leaves the site opens in a new tab and says so. */
function isExternal(href: string) {
  return /^https?:\/\//i.test(href);
}

/**
 * Portable Text keeps formatting beside the words: a span carries decorators
 * by name and annotations by key, and a paragraph flattened to plain text
 * loses every link in it. Each span is rebuilt here with its own marks.
 */
function renderSpan(span: PortableSpan, block: PortableBlock, index: number): ReactNode {
  const text = span.text ?? "";
  if (!text) return null;

  let content: ReactNode = text;
  for (const mark of span.marks ?? []) {
    const decorator = decorators[mark];
    if (decorator) content = decorator(content);
  }

  const annotation = (span.marks ?? [])
    .map((mark) => block.markDefs?.find((definition) => definition._key === mark))
    .find((definition) => definition?._type === "link" && definition.href);

  if (annotation?.href) {
    content = isExternal(annotation.href)
      ? <a href={annotation.href} rel="noreferrer" target="_blank">{content}<NewTabNote /></a>
      : <a href={annotation.href}>{content}</a>;
  }

  return <Fragment key={span._key || index}>{content}</Fragment>;
}

export function RichTextContent({ value, inlineContent }: RichTextContentProps) {
  if (!value?.length) return null;

  const showInlineContent = Boolean(
    inlineContent && value.length >= minimumBlocksForInlineContent,
  );

  if (typeof value[0] === "string") {
    return (
      <div className="prose">
        {(value as string[]).map((paragraph, index) => {
          const key = `${index}-${paragraph.slice(0, 16)}`;
          return (
            <Fragment key={key}>
              <p>{paragraph}</p>
              {showInlineContent && index === inlineContentIndex ? inlineContent : null}
            </Fragment>
          );
        })}
      </div>
    );
  }

  const blocks = value as PortableBlock[];

  return (
    <div className="prose">
      {blocks.map((block, index) => {
        if (!block.children?.some((span) => span.text)) return null;
        const spans = block.children.map((span, spanIndex) => renderSpan(span, block, spanIndex));
        const key = block._key || index;
        let content: ReactNode;
        if (block.style === "h2") content = <h2>{spans}</h2>;
        else if (block.style === "h3") content = <h3>{spans}</h3>;
        else if (block.style === "blockquote") content = <blockquote>{spans}</blockquote>;
        else content = <p>{spans}</p>;

        return (
          <Fragment key={key}>
            {content}
            {showInlineContent && index === inlineContentIndex ? inlineContent : null}
          </Fragment>
        );
      })}
    </div>
  );
}
