import type { PortableBlock, RichText } from "@/types/content";

export function RichTextContent({ value }: { value: RichText }) {
  if (!value?.length) return null;

  if (typeof value[0] === "string") {
    return (
      <div className="prose">
        {(value as string[]).map((paragraph, index) => (
          <p key={`${index}-${paragraph.slice(0, 16)}`}>{paragraph}</p>
        ))}
      </div>
    );
  }

  const blocks = value as PortableBlock[];

  return (
    <div className="prose">
      {blocks.map((block, index) => {
        const text = block.children?.map((child) => child.text || "").join("") || "";
        if (!text) return null;
        if (block.style === "h2") return <h2 key={block._key || index}>{text}</h2>;
        if (block.style === "h3") return <h3 key={block._key || index}>{text}</h3>;
        if (block.style === "blockquote") return <blockquote key={block._key || index}>{text}</blockquote>;
        return <p key={block._key || index}>{text}</p>;
      })}
    </div>
  );
}
