"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ContextLayersDiagram } from "./diagrams/context-layers";
import { CategoryTilesDiagram } from "./diagrams/category-tiles";
import { WorkspaceAnatomyDiagram } from "./diagrams/workspace-anatomy";
import { BrainstormToBuildDiagram } from "./diagrams/brainstorm-to-build";
import { ShelfAsDrawerDiagram } from "./diagrams/shelf-as-drawer";
import { ShellRemixDiagram } from "./diagrams/shell-remix";
import { DeviceFramesRow } from "./diagrams/device-frames";

export type AboutSection = {
  id: string;
  number: string;
  eyebrow: string;
  title: string;
  body: ReactNode;
  visual?: ReactNode;
  cta?: { label: string; href: string };
};

// ─── Small content primitives — kept here so each section reads top-to-bottom
// in one file and the structure is obvious to anyone editing copy. ────────────

function P({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p
      className={`text-[13.5px] leading-relaxed text-foreground/75 ${className ?? ""}`.trim()}
    >
      {children}
    </p>
  );
}

function B({ children }: { children: ReactNode }) {
  return <strong className="font-semibold text-foreground/90">{children}</strong>;
}

function Em({ children }: { children: ReactNode }) {
  return <em className="text-foreground/85">{children}</em>;
}

function UL({ children }: { children: ReactNode }) {
  return (
    <ul className="ml-1 list-none space-y-1.5 text-[13px] leading-relaxed text-foreground/70">
      {children}
    </ul>
  );
}

function LI({ children }: { children: ReactNode }) {
  return (
    <li className="relative pl-4 before:absolute before:left-0 before:top-[0.6em] before:h-1 before:w-1 before:rounded-full before:bg-foreground/35">
      {children}
    </li>
  );
}

function Callout({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-md border border-[#695be8]/[0.20] bg-[#695be8]/[0.06] px-3.5 py-2.5 text-[13px] leading-relaxed text-foreground/85">
      {children}
    </div>
  );
}

// ─── Sections ────────────────────────────────────────────────────────────────

export const aboutSections: AboutSection[] = [
  {
    id: "overview",
    number: "01",
    eyebrow: "Orientation",
    title: "The shape of the product",
    body: (
      <div className="space-y-3.5">
        <P>
          The whole product is one idea with three layers. <B>Knowledge</B> is what we know
          about the product — global, persistent, the source of truth. <B>Spaces</B> are
          where we think about a single problem — project-scoped, with their own context.{" "}
          <B>Chats, Canvas, and the Shelf</B> are how we actually do the thinking — talking,
          exploring, and keeping what's good.
        </P>
        <P>
          Everything else (Shells, Integrations, Mobile, Design system, Inspector) hangs off
          this spine.
        </P>
      </div>
    ),
    visual: <ContextLayersDiagram />,
  },
  {
    id: "knowledge",
    number: "02",
    eyebrow: "The source of truth",
    title: "Product Knowledge",
    body: (
      <div className="space-y-3.5">
        <P>
          The "what does the company already know about itself" layer. Every Space and every
          Chat reads from it. If something is true about the product, it lives here first.
        </P>
        <P>
          <B>Categories are user-configurable.</B> Each company organises Knowledge the way
          it actually thinks about itself — there's no fixed taxonomy. The defaults we ship
          (About Company, Feature Specs, Business Logic, Customers & Personas, Product
          Decisions, Design System) are a starting point. Teams add, rename, split, or
          remove categories to match their structure.
        </P>
        <P>
          <B>Anything goes inside.</B> A Knowledge item is any factual or visual asset the
          company wants the AI (and the team) to treat as ground truth:
        </P>
        <UL>
          <LI>Written docs (PRDs, specs, decision logs, FAQs)</LI>
          <LI>Sheets, dashboards, analytics exports</LI>
          <LI>PDFs, presentations, brand guidelines</LI>
          <LI>Figma files, prototypes, design tokens</LI>
          <LI>Videos, screen recordings, walkthroughs</LI>
          <LI>Web links, Notion pages, GitHub repos</LI>
          <LI>Audio notes, interview recordings</LI>
        </UL>
        <Callout>
          The one fully-wired promotion path: <B>Push from Space</B>. From a Space's Shelf,
          pick a kept output, pick a category, and we append it to Knowledge with source +
          timestamp. This is how a Space's good ideas graduate into long-term memory.
        </Callout>
      </div>
    ),
    visual: <CategoryTilesDiagram />,
    cta: { label: "Open Knowledge", href: "/knowledge" },
  },
  {
    id: "spaces",
    number: "03",
    eyebrow: "One project, one room",
    title: "Spaces",
    body: (
      <div className="space-y-3.5">
        <P>
          A Space is a workspace for a single problem ("Checkout v2", "Pricing redesign",
          "New onboarding"). Each Space has a name, a stage hint, and a{" "}
          <B>target platform</B> (web / mobile / universal) chosen at creation and locked —
          which decides device frames, build target (Next.js vs. Expo), and which scaffolds
          the AI pulls.
        </P>
        <P>
          A Space also carries its own <B>Space Context</B> (docs and links attached to this
          project only), <B>Connected Knowledge</B> (which Knowledge categories this Space
          pulls from), and <B>Instructions</B> for the AI.
        </P>
        <Callout>
          <B>Spaces are collaborative.</B> A Space isn't a single user's notebook — multiple
          product stakeholders (PM, designer, eng, research) work in the same Space. The
          Context, Shelf, and Canvas are shared, and they keep evolving and growing as
          people add docs, keep outputs, and push promotions back to Knowledge. The longer
          a Space lives, the richer its context gets for everyone in it.
        </Callout>
        <P>
          The AI in a Chat sees three layers — Product Knowledge → Space Context → message
          chips — and that's how answers get specific without anyone re-explaining the
          company every prompt.
        </P>
      </div>
    ),
    visual: <WorkspaceAnatomyDiagram />,
    cta: { label: "Open Spaces", href: "/spaces" },
  },
  {
    id: "chats",
    number: "04",
    eyebrow: "Linear conversation, kept outputs",
    title: "Chats",
    body: (
      <div className="space-y-3.5">
        <P>
          A Space has many Chats. Each Chat is a normal AI conversation, but with two
          special behaviors that make it more than a transcript.
        </P>
        <UL>
          <LI>
            <B>Output cards.</B> When the AI generates a wireframe, screen, approach,
            component, or built prototype, it shows up as a card <Em>inline</Em> in the
            message. Each card has a <B>Keep</B> button — keeping pins it to the Shelf for
            this Space.
          </LI>
          <LI>
            <B>Context chips.</B> Above the input, the user can attach Shelf items,
            Knowledge categories, or other context as chips. Whatever is chipped is sent
            with the next message — explicit, visible, removable.
          </LI>
        </UL>
        <P>
          The Keep gesture is what turns a stream of AI noise into a deliberate set of
          artifacts the user wants to keep exploring. It's the spine of every other
          surface.
        </P>
      </div>
    ),
  },
  {
    id: "canvas",
    number: "05",
    eyebrow: "Exploration as a spatial surface",
    title: "Canvas",
    body: (
      <div className="space-y-3.5">
        <P>
          Canvas is the second view of the same Shelf data. Where Chat is linear and
          sequential, Canvas is <B>spatial and parallel</B> — every kept output appears as
          a card on an infinite tldraw canvas, with a fidelity badge in the corner.
        </P>
        <P>
          Exploration sketches sit alongside wireframes, hi-fi screens, and built
          prototypes, all on the same surface. Built prototypes render as a live mini
          browser shape with a green "Live" pulse — the actual app, embedded in the canvas.
        </P>
        <Callout>
          <B>The brainstorm → explore → ideate → prototype bridge.</B> A PM or designer
          doesn't need to commit to fidelity up front. They ask for three approaches, get
          three rough HTML mocks on the canvas, dismiss two, ask the AI to "build this
          one out," and that single card upgrades into a full multi-file project — same
          canvas, no mode switch. The flow works in reverse too.
        </Callout>
        <P>The selection actions on a single card make it concrete:</P>
        <UL>
          <LI>
            <B>Create variations</B> — N variants, auto-arranged in a row.
          </LI>
          <LI>
            <B>Build this</B> — promotes a sketch into a real built project (files +
            routes + a Preview tab).
          </LI>
          <LI>
            <B>Combine</B> (multi-select) — merges 2+ outputs into a new one.
          </LI>
        </UL>
      </div>
    ),
    visual: <BrainstormToBuildDiagram />,
  },
  {
    id: "shelf",
    number: "06",
    eyebrow: "Approaches set aside to come back to",
    title: "Context Shelf",
    body: (
      <div className="space-y-3.5">
        <P>
          The right sidebar of a Space has two modes. <B>Context mode</B> (default on
          entry) shows Space Context items, Instructions, and Connected Knowledge.{" "}
          <B>Shelf mode</B> is the set-aside drawer.
        </P>
        <P>
          Every approach the user <Em>kept</Em> from a chat lands here: things they don't
          want to act on right now but want to brainstorm on later. Selecting items here
          lights them up as chips in the chat input, ready to feed back into a fresh round
          of thinking.
        </P>
        <P>
          Shelf and Canvas are the <B>same data, two views</B> of the kept set: Canvas is
          the spatial workbench (lay out, compare, combine, build); Shelf is the list view
          (a quiet inbox of approaches to revisit). Promote-to-Knowledge is triggered from
          here when something graduates from "interesting to brainstorm on" to "this is
          now true about the product."
        </P>
        <Callout>
          Keep is the gesture that says <Em>"not now, but later"</Em> — and the Shelf is
          where <Em>later</Em> lives.
        </Callout>
      </div>
    ),
    visual: <ShelfAsDrawerDiagram />,
  },
  {
    id: "shells",
    number: "07",
    eyebrow: "House style, remixable",
    title: "Shells",
    body: (
      <div className="space-y-3.5">
        <P>
          A Shell is a project template with opinion. It carries a <B>tech stack</B> (e.g.
          Next.js 16 + Tailwind + shadcn, or React Native + Expo + NativeWind), a{" "}
          <B>design system note</B>, <B>token preferences</B> (radius, surface, accents),
          connected Knowledge, instructions, and context items.
        </P>
        <P>
          A Shell can be <B>remixed into a new Space</B> in one click — the new Space
          inherits all of the above, so the AI starts producing on-brand, on-stack outputs
          from message one.
        </P>
        <P>
          The Shell workspace has its own pinned tabs: Canvas + <B>App preview</B>.
          Opening a Shell lands directly on App preview — the live UI, in the right device
          frame. We seed two: a B2B admin shell (web) and a mobile activity shell (RN /
          Expo, phone-frame preview).
        </P>
        <Callout>
          Shells encode <Em>"this is how we build at this company"</Em> once and reuse it
          forever. They sit between Knowledge (what we know) and Spaces (what we're working
          on right now) — the house-style layer.
        </Callout>
      </div>
    ),
    visual: <ShellRemixDiagram />,
    cta: { label: "Open Shells", href: "/shells" },
  },
  {
    id: "integrations",
    number: "08",
    eyebrow: "State of the world",
    title: "Integrations & Settings",
    body: (
      <div className="space-y-3.5">
        <P>
          <B>Integrations</B> (`/integrations`) lists Figma, Google Docs, Google Sheets,
          GitHub, and Linear. Two are mocked as "Connected"; the rest show "Connect"
          buttons. The feature shape is right; the wiring is phase-2.
        </P>
        <P>
          <B>Settings</B> (`/settings`) is a stub today.
        </P>
        <P className="text-foreground/55">
          Worth flagging out loud: integrations are the next big build-out, not something
          to demo.
        </P>
      </div>
    ),
  },
  {
    id: "design",
    number: "09",
    eyebrow: "Quiet UI, loud outputs",
    title: "Design language & live editing",
    body: (
      <div className="space-y-3.5">
        <P>
          Dark-first, on a Cursor + Figma reference: warm-dark surfaces (#282826 base),
          indigo/violet accent (#695be8), Inter throughout, 10px base radius, Lucide icons
          at 16px / 1.5 stroke. Layered backgrounds for elevation, borders only when
          separation needs to be loud. Animations are 150–250ms, framer-motion, never
          gratuitous.
        </P>
        <P>
          The principle is <B>"quiet UI, loud outputs"</B> — the chrome stays out of the
          way so the AI-generated content is what the eye lands on.
        </P>
        <P>
          <B>Live editing.</B> Inside a built prototype's Preview tab, the Inspector panel
          lets the user click any element in the live iframe and tweak font size, weight,
          color, border, radius — changes apply live via a postMessage bridge into the
          sandboxed iframe. Currently web-only; mobile previews use Expo Snack and don't
          support inspect.
        </P>
      </div>
    ),
  },
  {
    id: "mobile",
    number: "10",
    eyebrow: "First-class, not responsive afterthought",
    title: "Mobile-first direction",
    body: (
      <div className="space-y-3.5">
        <P>
          Mobile is a first-class target. The shape:
        </P>
        <UL>
          <LI>
            <B>Per-Space `targetPlatform`</B> decides everything downstream — locked at
            Space creation so the AI, the device frames, and the build pipeline stay
            aligned.
          </LI>
          <LI>
            <B>Device frames</B> — one DeviceFrame component, five variants (desktop,
            tablet, iPhone 15 Pro, iPhone SE, Pixel 8). Phone variants render the dynamic
            island / punch-hole, status bar, and home indicator. Used by Canvas, the Shell
            App preview, and the Preview tab.
          </LI>
          <LI>
            <B>On Device tab</B> — for mobile Spaces, the container has an On Device tab
            with an inline Expo Snack runner placeholder and a Share overlay (QR + pairing
            event log). Pairing is mocked for the prototype; the UI is real.
          </LI>
          <LI>
            <B>Mock RN builds</B> — mobile outputs emit a real BuildProject with{" "}
            <code className="rounded bg-white/[0.06] px-1 py-0.5 text-[11.5px] text-foreground/80">
              framework: "expo"
            </code>{" "}
            and a snackSource string. The seeded Activity Tracker demo ships with full RN
            code so the demo runs end-to-end.
          </LI>
          <LI>
            <B>Mobile shell + auto-seeded mobile spaces</B> — there's a "Mobile activity
            shell" seed and an auto-seed for new mobile Spaces so the demo always has
            something to show.
          </LI>
        </UL>
        <P>
          The same brainstorm → explore → build flow works for a fitness app's home screen
          as for a B2B admin console. The platform is metadata; the workflow is one.
        </P>
      </div>
    ),
    visual: <DeviceFramesRow />,
    cta: { label: "Open a mobile Space", href: "/spaces" },
  },
  {
    id: "demo",
    number: "11",
    eyebrow: "The whole product in six clicks",
    title: "Demo script",
    body: (
      <div className="space-y-3.5">
        <P>If you're walking someone through the product cold:</P>
        <ol className="ml-1 list-none space-y-2 text-[13px] leading-relaxed text-foreground/70">
          {[
            <>
              <B>Open `/knowledge`</B> — show the categories and item counts (mention
              they're user-configured per company). "This is the source of truth — what
              the AI always knows about us."
            </>,
            <>
              <B>Open `/shells`</B> — open the Mobile activity shell. App preview lands
              first; phone frame, dark fitness UI. "This is the house-style layer."
            </>,
            <>
              <B>Open a Space</B> — show the three context layers in the right sidebar.
              Send a message. Show that the answer is on-brand because of the layers
              above.
            </>,
            <>
              <B>Keep an output</B> → switch to <B>Canvas</B> → select two cards,
              "Combine" → select one, "Build this." Walk through brainstorm → explore →
              prototype on a single surface.
            </>,
            <>
              <B>Open the Preview tab</B> of the built output → toggle the Inspector →
              tweak a color live.
            </>,
            <>
              <B>Open a mobile Space</B> → On Device tab → show the Snack runner + Share
              QR.
            </>,
          ].map((step, i) => (
            <li key={i} className="flex gap-2.5">
              <span className="shrink-0 rounded-full border border-white/[0.10] bg-white/[0.03] px-2 py-0.5 text-[10.5px] font-medium text-foreground/55">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
        <P className="text-foreground/55">That's the whole product in six clicks.</P>
      </div>
    ),
  },
];

// ─── Section renderer ────────────────────────────────────────────────────────

export function SectionRenderer({
  section,
  onCtaClick,
}: {
  section: AboutSection;
  onCtaClick?: () => void;
}) {
  return (
    <section
      id={section.id}
      data-section-id={section.id}
      className="scroll-mt-6 space-y-4 py-6"
    >
      <div className="space-y-1.5">
        <div className="flex items-baseline gap-3">
          <span className="text-[10.5px] font-mono font-medium text-foreground/35">
            {section.number}
          </span>
          <span className="text-[10.5px] font-medium uppercase tracking-wide text-foreground/45">
            {section.eyebrow}
          </span>
        </div>
        <h2 className="text-[20px] font-semibold leading-tight text-foreground">
          {section.title}
        </h2>
      </div>

      {section.body}

      {section.visual}

      {section.cta && (
        <Link
          href={section.cta.href}
          onClick={onCtaClick}
          className="inline-flex items-center gap-1.5 rounded-md border border-white/[0.12] bg-white/[0.02] px-3 py-1.5 text-xs font-medium text-foreground/80 transition-colors hover:border-white/[0.18] hover:bg-white/[0.06] hover:text-foreground"
        >
          {section.cta.label}
          <ArrowRight size={12} strokeWidth={1.8} />
        </Link>
      )}
    </section>
  );
}
