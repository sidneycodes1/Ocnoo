import type { Policy, PolicyBlock } from "@/content/policies";
import PolicyContents from "./PolicyContents";

// Policy / legal document layout.
//
// The structure is the one used by GitHub's site policy and Google's privacy
// policy: a sticky index of the section headings beside a single measured text
// column, with hairlines between sections. Below `xl` the rail is replaced by a
// collapsed contents list above the text, because a 17-link list ahead of the
// content pushes the document off the screen on a phone.
//
// Colours are our own tokens — light page, ink text, `border-line` hairlines,
// the active index item marked with an ink bar — not the reference design's
// dark palette.

function Block({ block }: { block: PolicyBlock }) {
  switch (block.kind) {
    case "para":
      return (
        <p className="mt-3 font-sans text-[15px] leading-relaxed md:text-base">
          {block.text}
        </p>
      );
    case "sub":
      return (
        <h3 className="mt-5 font-sans text-sm font-extrabold uppercase tracking-wide text-black/70">
          {block.text}
        </h3>
      );
    case "list": {
      const ListTag = block.ordered ? "ol" : "ul";
      return (
        <ListTag
          className={`mt-3 flex flex-col gap-2 pl-5 font-sans text-[15px] leading-relaxed md:text-base ${
            block.ordered ? "list-decimal" : "list-disc"
          } marker:text-black/40`}
        >
          {block.items.map((item, i) => (
            <li key={i} className="pl-0.5">
              {item}
            </li>
          ))}
        </ListTag>
      );
    }
    case "fields":
      return (
        <dl className="mt-4 grid gap-x-6 gap-y-3 sm:grid-cols-[minmax(0,11rem)_minmax(0,1fr)]">
          {block.items.map((field) => (
            <div key={field.label} className="flex flex-col gap-0.5 sm:contents">
              <dt className="font-sans text-xs font-bold uppercase tracking-wide text-black/45">
                {field.label}
              </dt>
              <dd className="font-sans text-sm break-words">
                {field.href ? (
                  <a
                    href={field.href}
                    className="font-bold underline decoration-line underline-offset-4 hover:decoration-black/50"
                    {...(/^https?:/.test(field.href)
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                  >
                    {field.value}
                  </a>
                ) : (
                  <span className="font-bold">{field.value}</span>
                )}
              </dd>
            </div>
          ))}
        </dl>
      );
  }
}

export default function PolicyPage({ policy }: { policy: Policy }) {
  const items = policy.sections.map((section) => ({
    id: section.id,
    label: section.heading,
  }));

  return (
    <div className="mx-auto max-w-6xl animate-fade-in px-4 pb-10">
      <div className="xl:grid xl:grid-cols-[19rem_minmax(0,1fr)] xl:gap-12">
        {/* Desktop: sticky section index. `stack-rail` lives in globals.css and
            pins `top`/`max-height` to the sticky header. */}
        <aside className="stack-rail hidden xl:block">
          <PolicyContents items={items} variant="rail" />
        </aside>

        <article className="py-4 md:py-8">
          <header className="border-b border-line pb-5">
            {/* The mobile screen header already shows the document title, so it
                is announced but not repeated visually below md. */}
            <h1 className="sr-only font-sans text-3xl font-extrabold uppercase tracking-tight md:not-sr-only md:text-4xl">
              {policy.title}
            </h1>
            {policy.standfirst && (
              <p className="mt-1 font-sans text-[11px] font-bold uppercase tracking-[0.12em] text-black/45 md:mt-2 md:text-xs">
                {policy.standfirst}
              </p>
            )}
            {policy.effective ? (
              <p className="mt-1 font-sans text-sm text-black/55">
                {`Effective ${policy.effective}`}
              </p>
            ) : (
              // A real document that states no date says so. Our own placeholder
              // copy says nothing, because there is no source document behind it.
              policy.placeholder ? null : (
                <p className="mt-1 font-sans text-sm text-black/55">
                  No effective date stated in the source document
                </p>
              )
            )}
          </header>

          {/* Phone and tablet: the same links, collapsed so the document still
              starts near the top of the screen. */}
          <details className="mt-5 rounded-xl border border-line bg-white p-3 xl:hidden">
            {/* `min-h-11` is the tap target: a bare summary is only as tall as
                its 20px line of text, which is well under the 44px the rest of
                the app's controls use. */}
            <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 font-sans text-sm font-extrabold uppercase tracking-wide [&::-webkit-details-marker]:hidden">
              <span>Contents · {policy.sections.length} sections</span>
              <span aria-hidden="true" className="text-black/40">
                ⌄
              </span>
            </summary>
            <div className="mt-3 border-t border-line pt-3">
              <PolicyContents items={items} variant="disclosure" />
            </div>
          </details>

          <div>
            {policy.sections.map((section) => (
              <section
                key={section.id}
                id={section.id}
                className="stack-anchor border-b border-line pb-7 pt-6"
              >
                <h2 className="font-sans text-base font-extrabold tracking-tight md:text-lg">
                  {section.heading}
                </h2>
                {section.blocks.map((block, i) => (
                  <Block key={i} block={block} />
                ))}
              </section>
            ))}
          </div>

          {policy.outro && (
            <section className="border-b border-line pb-7 pt-6">
              <h2 className="font-sans text-base font-extrabold tracking-tight md:text-lg">
                {policy.outro.heading}
              </h2>
              {policy.outro.blocks.map((block, i) => (
                <Block key={i} block={block} />
              ))}
            </section>
          )}

          <p className="mt-6 font-sans text-sm">
            {/* `#top` is a fragment the HTML spec reserves for the top of the
                document, so this needs no id on an element and no script —
                which matters because this file renders on the server. */}
            <a
              href="#top"
              className="font-bold underline decoration-line underline-offset-4 hover:decoration-black/50"
            >
              Back to top
            </a>
          </p>

          <p className="mt-8 rounded-md bg-surface p-4 font-sans text-sm text-black/60">
            {policy.placeholder
              ? "This is placeholder demo copy for a design mockup — not real legal advice. Replace it with reviewed, business-specific text before launch."
              : "This page reproduces the policy text supplied by King Ocnoo Computer Ventures. The store itself is a design demo, so have the wording reviewed before it is published as a live policy."}
          </p>
        </article>
      </div>
    </div>
  );
}
