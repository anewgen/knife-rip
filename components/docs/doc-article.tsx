import type { DocPageDefinition } from "@/lib/docs/types";

export function DocArticle({ doc }: { doc: DocPageDefinition }) {
  return (
    <article className="prose-docs text-muted">
      {doc.sections.map((s) => (
        <section key={s.id} id={s.id} className="scroll-mt-32">
          <h2>{s.title}</h2>
          <div className="flex flex-col gap-3">{s.content}</div>
        </section>
      ))}
    </article>
  );
}
