// Content model for the policy pages.
//
// The business's documents (DOCS.pdf, effective 11 October 2026) do not consist
// of plain paragraphs: almost every section carries a numbered clause list or a
// bulleted list, and the contact sections are label/value pairs. `InfoPage`'s
// `body: string[]` could not express any of that, which is why these pages were
// still carrying invented placeholder copy. This model can hold the real text
// without paraphrasing it.

export type PolicyBlock =
  | { kind: "para"; text: string }
  | {
      /** A run-in heading inside a section, e.g. "A. Personal and contact information". */
      kind: "sub";
      text: string;
    }
  | {
      kind: "list";
      /** Numbered clauses in the source document become an ordered list. */
      ordered?: boolean;
      items: string[];
    }
  | {
      /** Label/value pairs, rendered as a <dl> so phone/email can be live links. */
      kind: "fields";
      items: { label: string; value: string; href?: string }[];
    };

export interface PolicySection {
  /** Anchor id, used by the contents rail and by the scroll offset. */
  id: string;
  heading: string;
  blocks: PolicyBlock[];
}

export interface Policy {
  title: string;
  /**
   * Every dated document supplied states 11 October 2026. The safety-tips
   * document states no date, so this is optional rather than assumed.
   */
  effective?: string;
  /** Line under the title: "An online retail brand of King Ocnoo Computer Ventures". */
  standfirst?: string;
  sections: PolicySection[];
  /** Closing block such as "Customer acknowledgement". */
  outro?: { heading: string; blocks: PolicyBlock[] };
  /**
   * True while a page still carries invented copy. It controls the notice at
   * the foot of the page, so a real policy can never claim to be a mockup and a
   * mockup can never claim to be a policy.
   */
  placeholder?: boolean;
}
