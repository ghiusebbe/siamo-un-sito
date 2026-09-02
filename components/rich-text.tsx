import { Fragment, type ReactNode } from "react";
import type { PortableBlock, RichText } from "@/types/content";

type RichTextContentProps = {
  inlineContent?: ReactNode;
  value: RichText;
};

const minimumBlocksForInlineContent = 5;
const inlineContentIndex = 2;

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
        const text = block.children?.map((child) => child.text || "").join("") || "";
        if (!text) return null;
        const key = block._key || index;
        let content: ReactNode;
        if (block.style === "h2") content = <h2>{text}</h2>;
        else if (block.style === "h3") content = <h3>{text}</h3>;
        else if (block.style === "blockquote") content = <blockquote>{text}</blockquote>;
        else content = <p>{text}</p>;

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
