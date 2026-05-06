"use client";

import * as React from "react";

/**
 * Mini-sketch previews for extracted components. Each component candidate
 * carries a `previewKey` (string) that maps to one of these renderers.
 *
 * The renderings are intentionally small, schematic, and consistent —
 * think "wireframe icon" not "marketing screenshot." All built with
 * inline divs + Tailwind so they scale at any container size.
 */

type PreviewProps = { className?: string };

function Frame({
  children,
  bg = "bg-[#11131a]",
  className,
}: {
  children: React.ReactNode;
  bg?: string;
  className?: string;
}) {
  return (
    <div
      className={`relative h-full w-full overflow-hidden rounded-lg ${bg} ${className ?? ""}`}
    >
      {children}
    </div>
  );
}

// 1. DeliverySlotPicker — 3×2 grid of small chip pills, one highlighted
function DeliverySlotPickerPreview() {
  const slots = [
    "9–11",
    "11–1",
    "1–3",
    "3–5",
    "5–7",
    "7–9",
  ];
  return (
    <Frame bg="bg-gradient-to-br from-[#1a1f2e] to-[#0f1419]">
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 p-3">
        <div className="text-[8px] font-semibold uppercase tracking-wider text-white/45">
          Tomorrow
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {slots.map((s, i) => (
            <div
              key={s}
              className={
                i === 2
                  ? "rounded-md bg-indigo-500 px-2 py-1 text-[9px] font-semibold text-white"
                  : "rounded-md border border-white/15 px-2 py-1 text-[9px] font-medium text-white/55"
              }
            >
              {s}
            </div>
          ))}
        </div>
      </div>
    </Frame>
  );
}

// 2. TipSelector — 4 tip chips
function TipSelectorPreview() {
  const tips = ["10%", "15%", "20%", "Custom"];
  return (
    <Frame bg="bg-gradient-to-br from-[#1c1820] to-[#13101a]">
      <div className="absolute inset-0 flex items-center justify-center gap-1.5 p-3">
        {tips.map((t, i) => (
          <div
            key={t}
            className={
              i === 1
                ? "rounded-full bg-amber-400 px-2.5 py-1 text-[10px] font-bold text-amber-950"
                : "rounded-full border border-white/15 px-2.5 py-1 text-[10px] font-semibold text-white/65"
            }
          >
            {t}
          </div>
        ))}
      </div>
    </Frame>
  );
}

// 3. AddressAutocomplete — search bar + 3 dropdown rows
function AddressAutocompletePreview() {
  return (
    <Frame bg="bg-gradient-to-br from-[#0f1424] to-[#0a0d18]">
      <div className="absolute inset-0 flex flex-col gap-1 p-3">
        <div className="flex h-6 items-center gap-1.5 rounded-md border border-white/15 bg-white/[0.04] px-2">
          <span className="h-1.5 w-1.5 rounded-full bg-white/30" />
          <span className="text-[9px] text-white/65">742 Evergreen…</span>
        </div>
        <div className="rounded-md border border-white/10 bg-white/[0.03] p-1.5">
          {[
            "742 Evergreen Ter, Springfield",
            "742 Maple Rd, Shelbyville",
            "7421 Brookside Dr, Capital",
          ].map((s, i) => (
            <div
              key={i}
              className={`flex items-center gap-1.5 px-1 py-0.5 text-[8.5px] ${
                i === 0 ? "text-white/85" : "text-white/45"
              }`}
            >
              <span className="text-[10px] text-indigo-400">⌖</span>
              <span className="truncate">{s}</span>
            </div>
          ))}
        </div>
      </div>
    </Frame>
  );
}

// 4. PromoCodeChip — green pill
function PromoCodeChipPreview() {
  return (
    <Frame bg="bg-gradient-to-br from-[#0f1c14] to-[#0a130d]">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/15 px-3 py-1.5">
          <span className="text-[10px] font-bold text-emerald-400">✓</span>
          <span className="text-[10px] font-semibold tracking-wide text-emerald-200">
            PROMO20
          </span>
          <span className="text-[10px] text-emerald-200/60">−$5.00</span>
          <span className="text-[10px] text-emerald-200/40">×</span>
        </div>
      </div>
    </Frame>
  );
}

// 5. PaymentMethodSelector — 3 mini card tiles in a row
function PaymentMethodSelectorPreview() {
  const cards = [
    { label: "•••• 4242", grad: "from-indigo-700 to-indigo-900" },
    { label: "•••• 1881", grad: "from-zinc-700 to-zinc-900" },
    { label: "+ Add", grad: "from-white/[0.04] to-white/[0.04]", dashed: true },
  ];
  return (
    <Frame bg="bg-gradient-to-br from-[#11131a] to-[#0a0c12]">
      <div className="absolute inset-0 flex items-center justify-center gap-2 p-3">
        {cards.map((c, i) => (
          <div
            key={i}
            className={`flex h-12 w-16 flex-col justify-end rounded-md bg-gradient-to-br p-1.5 text-[8px] text-white/85 ${c.grad} ${
              c.dashed ? "border border-dashed border-white/15 text-white/40" : ""
            } ${i === 0 ? "ring-2 ring-indigo-400/60" : ""}`}
          >
            {c.label}
          </div>
        ))}
      </div>
    </Frame>
  );
}

// 6. OrderProgressTracker — 4 dots with connecting line, 2 filled
function OrderProgressTrackerPreview() {
  const labels = ["Placed", "Prep", "Out", "Done"];
  return (
    <Frame bg="bg-gradient-to-br from-[#0f1424] to-[#0a0d18]">
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-3">
        <div className="relative flex w-full items-center justify-between px-2">
          <div className="absolute left-3 right-3 top-1/2 h-px -translate-y-1/2 bg-white/15" />
          <div className="absolute left-3 top-1/2 h-px w-1/3 -translate-y-1/2 bg-emerald-400" />
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`relative z-10 h-2.5 w-2.5 rounded-full ${
                i <= 1
                  ? "bg-emerald-400 ring-2 ring-emerald-400/30"
                  : "bg-white/15"
              }`}
            />
          ))}
        </div>
        <div className="flex w-full justify-between px-1 text-[7.5px] font-medium uppercase tracking-wider">
          {labels.map((l, i) => (
            <span
              key={l}
              className={i <= 1 ? "text-emerald-300" : "text-white/30"}
            >
              {l}
            </span>
          ))}
        </div>
      </div>
    </Frame>
  );
}

// 7. ItemRecommender — 3 small product squares
function ItemRecommenderPreview() {
  const items = [
    { bg: "from-amber-300 to-amber-500", price: "$12" },
    { bg: "from-rose-300 to-rose-500", price: "$24" },
    { bg: "from-sky-300 to-sky-500", price: "$8" },
  ];
  return (
    <Frame bg="bg-gradient-to-br from-[#0f0f15] to-[#08080d]">
      <div className="absolute inset-0 flex flex-col gap-1.5 p-3">
        <div className="text-[8px] font-semibold uppercase tracking-wider text-white/40">
          Customers also bought
        </div>
        <div className="flex gap-1.5">
          {items.map((it, i) => (
            <div key={i} className="flex flex-1 flex-col gap-1">
              <div
                className={`h-10 rounded-md bg-gradient-to-br ${it.bg}`}
              />
              <div className="text-[8px] font-semibold text-white/85">
                {it.price}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Frame>
  );
}

// 8. PrimaryButton — DS atom; intentionally simple. Default-skipped.
function PrimaryButtonPreview() {
  return (
    <Frame bg="bg-gradient-to-br from-[#11131a] to-[#0a0c12]">
      <div className="absolute inset-0 flex items-center justify-center p-3">
        <div className="rounded-lg bg-indigo-500 px-5 py-2.5 text-[11px] font-semibold text-white shadow-lg shadow-indigo-500/30">
          Continue
        </div>
      </div>
    </Frame>
  );
}

// 9. FormField — DS atom; default-skipped.
function FormFieldPreview() {
  return (
    <Frame bg="bg-gradient-to-br from-[#11131a] to-[#0a0c12]">
      <div className="absolute inset-0 flex flex-col items-stretch justify-center gap-1 px-5 py-3">
        <div className="text-[8px] font-semibold uppercase tracking-wider text-white/40">
          Email
        </div>
        <div className="flex h-7 items-center rounded-md border border-white/15 bg-white/[0.04] px-2 text-[10px] text-white/65">
          alex@example.com
        </div>
      </div>
    </Frame>
  );
}

const REGISTRY: Record<string, React.ComponentType<PreviewProps>> = {
  "delivery-slot-picker": DeliverySlotPickerPreview,
  "tip-selector": TipSelectorPreview,
  "address-autocomplete": AddressAutocompletePreview,
  "promo-code-chip": PromoCodeChipPreview,
  "payment-method-selector": PaymentMethodSelectorPreview,
  "order-progress-tracker": OrderProgressTrackerPreview,
  "item-recommender": ItemRecommenderPreview,
  "primary-button": PrimaryButtonPreview,
  "form-field": FormFieldPreview,
};

export function ComponentPreview({
  previewKey,
}: {
  previewKey: string;
}) {
  const Renderer = REGISTRY[previewKey];
  if (!Renderer) {
    return (
      <div className="flex h-full w-full items-center justify-center rounded-lg bg-white/[0.04] text-[10px] text-foreground/40">
        {previewKey}
      </div>
    );
  }
  return <Renderer />;
}
