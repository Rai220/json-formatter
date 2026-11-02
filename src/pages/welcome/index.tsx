import { Link } from "react-router-dom";
// Every tile glyph is a *Filled* variant. Tabler's outline icons are stroked,
// and at 60px next to a 24px heading they read wiry next to a filled one — so
// mixing the two sets is what makes a tile grid look homemade. `IconBraces` is
// the exception and stays stroked: it is the product's mark, and a brace has no
// filled form to switch to.
import {
  IconAlertTriangleFilled,
  IconBraces,
  IconCodeCircleFilled,
  IconExchangeFilled,
  IconFileUploadFilled,
  IconLinkFilled,
  IconLockFilled,
} from "@tabler/icons-react";
import { AppIcon } from "@/components/tools/app-icon";
import { BrowserFrame } from "@/components/tools/browser-frame";
import { Reveal, RevealItem } from "@/components/tools/reveal";
import { Faq } from "@/components/welcome/faq";
import { Tile, TileIconGradient, TILE_ICON_FILL } from "@/components/welcome/tile";
import { EditorMock } from "@/components/welcome/editor-mock";
import { FormatVisual, LinkVisual } from "@/components/welcome/visuals";
import { APP_TINT } from "@/lib/tints";
import "./welcome.css";

/**
 * Welcome — the marketing page for the formatter.
 *
 * Shape borrowed from Apple's iCloud pages, which are a kit rather than one
 * layout: the same 100px app icon, 86px name, 24px tagline and black pill turn
 * up on every one, while the tiles below get rearranged per app. iCloud Drive
 * runs the hero alone; icloud.com pairs two big tiles; Mail fans out seven in
 * mixed widths.
 *
 * Ours steps down in three sizes — two big, three small, one wide — because we
 * have two features worth a picture and a handful of short facts, which is a
 * different shape of content from Mail's seven equal ones. The row of three is
 * the deliberate departure: Apple only ever uses halves and fulls.
 *
 * This page is `/`; the editor is `/editor`. A share link carries its whole
 * document in the URL hash, so an old link pointing at `/#...` would otherwise
 * land here and lose it — `Front` in `App.tsx` forwards those on.
 */

const LABEL = "var(--w-label)";
const MUTED = "var(--w-muted)";

const icon = (Glyph: typeof IconLockFilled) => <Glyph size={60} color={TILE_ICON_FILL} />;

export default function Welcome() {
  return (
    <div data-welcome data-tint={APP_TINT} data-motion="rise" className="min-h-screen" style={{ backgroundColor: "var(--w-page)" }}>
      <TileIconGradient />

      <header className="sticky top-0 z-50 flex h-11 w-full items-center justify-between px-4 sm:px-6"
        style={{ backgroundColor: "color-mix(in srgb, var(--w-page) 72%, transparent)", backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)" }}>
        <div className="flex items-center gap-2">
          <IconBraces size={22} style={{ color: "var(--tint-to)" }} />
          <span className="text-[17px] font-semibold leading-none" style={{ color: LABEL }}>
            JSON Formatter
          </span>
        </div>
        <Link to="/editor" className="-mr-2 inline-flex min-h-11 items-center rounded-md px-2 text-[15px] font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tint-to)]" style={{ color: "var(--tint-to)" }}>
          Open editor
        </Link>
      </header>

      <main>
      {/* ── hero ────────────────────────────────────────────────────────── */}
      <section className="mx-auto flex w-full max-w-[1380px] flex-col items-center px-6 pt-[8vh] text-center">
        <AppIcon icon={<IconBraces size={62} strokeWidth={2} />} />

        <h1
          className="mt-7 font-semibold tracking-tight"
          style={{ fontSize: "clamp(44px, 8vw, 86px)", lineHeight: 1.05, color: LABEL }}
        >
          JSON Formatter
        </h1>

        <p className="mt-3 max-w-[520px] text-[24px] font-semibold leading-[30px]" style={{ color: LABEL }}>
          Paste it messy. Read it clean. Share the link.
        </p>

        <Link
          to="/editor"
          className="mt-8 flex h-11 items-center rounded-full px-7 text-[17px] font-semibold"
          style={{ backgroundColor: "var(--w-cta-bg)", color: "var(--w-cta-fg)" }}
        >
          Open editor
        </Link>

        <p className="mt-4 text-[13px]" style={{ color: MUTED }}>
          Runs entirely in your browser. Nothing is uploaded.
        </p>

        <BrowserFrame className="mt-[clamp(40px,7vw,64px)] max-w-[1006px]" url="json-formatter.app">
          <EditorMock />
        </BrowserFrame>
      </section>

      {/* ── tiles: two big, three small, one wide ───────────────────────── */}
      <section className="mx-auto w-full max-w-[1380px] px-6 pt-[clamp(64px,10vw,120px)]">
        <Reveal>
          <RevealItem>
            <div className="grid grid-cols-1 gap-[50px] lg:grid-cols-2">
              <Tile
                icon={icon(IconCodeCircleFilled)}
                heading="Messy in, clean out."
                visual={<FormatVisual />}
                className="min-h-[520px]"
              >
                Indent it so a person can read it, or minify it so a wire can carry
                it. Same document, one click apart.
              </Tile>

              <Tile
                icon={icon(IconLinkFilled)}
                heading="The link is the document."
                visual={<LinkVisual />}
                className="min-h-[520px]"
              >
                Sharing uploads nothing. The whole document is squeezed into the
                link itself, so whoever opens it sees exactly what you saw.
              </Tile>
            </div>
          </RevealItem>
        </Reveal>

        <Reveal>
          <RevealItem>
            <div className="mt-[50px] grid grid-cols-1 gap-[50px] md:grid-cols-3">
              <Tile icon={icon(IconAlertTriangleFilled)} heading="Says where it broke.">
                Bad JSON gets a line and a column, and a sentence you can actually
                read — not a stack trace.
              </Tile>

              <Tile icon={icon(IconExchangeFilled)} heading="JSON in, YAML out.">
                XML as well, and CSV for the flat parts. One document, four ways of
                looking at it.
              </Tile>

              <Tile icon={icon(IconFileUploadFilled)} heading="Drop in a file.">
                Open a <code>.json</code> straight off your machine, up to 5 MB, and
                carry on where you left off.
              </Tile>
            </div>
          </RevealItem>
        </Reveal>

        <Reveal>
          <RevealItem>
            <Tile
              icon={icon(IconLockFilled)}
              heading="Nothing leaves your browser."
              wide
              className="mt-[50px]"
            >
              There is no account, no upload and no server to send it to. Everything
              happens on your own machine — which means you can safely paste the
              payload from production.
            </Tile>
          </RevealItem>
        </Reveal>
      </section>

      {/* ── questions ───────────────────────────────────────────────────── */}
      <div className="pt-[clamp(72px,11vw,140px)] pb-[clamp(56px,8vw,96px)]">
        <Faq />
      </div>

      </main>

      <footer className="w-full px-6 py-12" style={{ borderTop: `1px solid var(--w-hairline)` }}>
        <div className="mx-auto flex max-w-[1380px] flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <div className="flex items-center gap-2">
            <IconBraces size={20} style={{ color: "var(--tint-to)" }} />
            <span className="text-[15px] font-semibold" style={{ color: LABEL }}>
              JSON Formatter
            </span>
          </div>
          <span className="text-[13px]" style={{ color: MUTED }}>
            © 2026 JSON Formatter
          </span>
        </div>
      </footer>
    </div>
  );
}
