// Shared layout for static informational / legal placeholder pages.
// Keeps the legal pages consistent without duplicating markup.
export interface InfoSection {
  heading: string;
  body: string[];
}

interface InfoPageProps {
  title: string;
  updated?: string;
  intro?: string;
  sections: InfoSection[];
}

export default function InfoPage({
  title,
  updated,
  intro,
  sections,
}: InfoPageProps) {
  return (
    <div className="mx-auto max-w-3xl animate-fade-in px-4 py-10">
      {/* The mobile screen header already shows the document title, so the
          heading is announced but not repeated visually below md. */}
      <h1 className="font-sans text-3xl font-extrabold uppercase tracking-tight md:text-4xl sr-only md:not-sr-only">
        {title}
      </h1>
      {updated && (
        <p className="mt-2 font-sans text-sm text-black/50">
          Last updated: {updated}
        </p>
      )}
      {intro && (
        <p className="mt-4 font-sans text-base leading-relaxed">{intro}</p>
      )}

      <div className="mt-8 flex flex-col gap-6">
        {sections.map((section) => (
          <section key={section.heading}>
            <h2 className="font-sans text-lg font-extrabold uppercase">
              {section.heading}
            </h2>
            {section.body.map((para, i) => (
              <p
                key={i}
                className="mt-2 font-sans text-base leading-relaxed"
              >
                {para}
              </p>
            ))}
          </section>
        ))}
      </div>

      <p className="mt-10 rounded-md bg-surface p-4 font-sans text-sm text-black/60">
        This is placeholder demo copy for a design mockup — not real legal
        advice. Replace it with reviewed, business-specific text before launch.
      </p>
    </div>
  );
}
