import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

/**
 * The questions block that closes the page.
 *
 * Deliberately plain — no card, no fill, no colour. Measured off iCloud Mail:
 * the heading is 32/600, each question 21/600, rows are 53px tall and separated
 * by Apple's standard hairline. The restraint is the point; it sits after a run
 * of white tiles and should read as a quiet epilogue, not another section.
 */

const LABEL = "var(--w-label)";
const SEPARATOR = "var(--w-hairline)";

const QUESTIONS = [
  {
    q: "Is my JSON sent anywhere?",
    a: "No. There is no server to send it to. Parsing, formatting and converting all happen in your browser, and your document is kept on your own machine.",
  },
  {
    q: "How big a file can I open?",
    a: "Up to 5 MB from the file picker. Pasting is not capped, though very large documents will feel slower to re-format as you type.",
  },
  {
    q: "Does a share link expire?",
    a: "No, because there is nothing stored to expire. The document is compressed into the link itself, so the link keeps working as long as you have it. Very large documents are too big to fit in one and will say so.",
  },
  {
    q: "Can I convert to something other than JSON?",
    a: "Yes — YAML, XML, and CSV for the flat parts of a document. The converted text appears in the output pane, ready to copy.",
  },
];

export function Faq() {
  return (
    <section className="mx-auto w-full max-w-[1380px] px-6">
      <h2 className="text-[32px] font-semibold leading-tight" style={{ color: LABEL }}>
        Questions? Answered.
      </h2>

      <Accordion type="single" collapsible className="mt-10 w-full">
        {QUESTIONS.map(({ q, a }) => (
          <AccordionItem key={q} value={q} style={{ borderBottom: `1px solid ${SEPARATOR}` }}>
            <AccordionTrigger
              className="rounded-md py-4 text-left text-[21px] font-semibold hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tint-to)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--w-page)]"
              style={{ color: LABEL }}
            >
              {q}
            </AccordionTrigger>
            <AccordionContent className="pb-5 text-[17px] leading-[25px]" style={{ color: LABEL }}>
              {a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
