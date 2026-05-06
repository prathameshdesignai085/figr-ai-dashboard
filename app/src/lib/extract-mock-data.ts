"use client";

import type { ExtractedComponent } from "@/types";

/**
 * Hand-authored "AI extraction" candidates per Space. The runner reads
 * these in lieu of an actual code-analysis pass.
 *
 * Sets are biased toward **custom composite components** — the kind that
 * a designer would actually want to ship to dev because they're NOT in
 * any existing design system. Generic atoms (Button, FormField) still
 * appear at the bottom but are flagged low-quality with explicit
 * "your DS likely has this" reasoning, so the AI's judgement looks honest.
 */

const checkoutCandidates: Omit<ExtractedComponent, "id">[] = [
  {
    name: "DeliverySlotPicker",
    description:
      "Pick a 2-hour delivery window from an availability grid.",
    reasoning:
      "Custom domain widget — date selector + slot grid + per-slot availability state. Not a primitive any DS will ship out of the box. Logic for grouping slots, disabling sold-out windows, and tomorrow/today switching is product-specific and worth its own component.",
    qualityScore: 92,
    sourceStateNames: ["Shipping address", "Order review"],
    usageCount: 2,
    defaultInclude: true,
    previewKey: "delivery-slot-picker",
    code: {
      language: "tsx",
      content: `type Slot = { id: string; label: string; available: boolean };
type Day = { id: string; label: string; slots: Slot[] };

type Props = {
  days: Day[];
  selectedSlotId?: string;
  onSelect: (slotId: string) => void;
};

export function DeliverySlotPicker({ days, selectedSlotId, onSelect }: Props) {
  const [activeDayId, setActiveDayId] = useState(days[0]?.id);
  const day = days.find((d) => d.id === activeDayId);

  return (
    <div className="rounded-xl border border-gray-200 p-4">
      <div className="flex gap-2 mb-3 overflow-x-auto">
        {days.map((d) => (
          <button
            key={d.id}
            onClick={() => setActiveDayId(d.id)}
            className={\`px-3 h-8 rounded-full text-xs font-semibold \${
              d.id === activeDayId
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 text-gray-700"
            }\`}
          >
            {d.label}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {day?.slots.map((s) => (
          <button
            key={s.id}
            disabled={!s.available}
            onClick={() => onSelect(s.id)}
            className={\`h-10 rounded-md text-sm font-medium \${
              s.id === selectedSlotId
                ? "bg-indigo-600 text-white"
                : s.available
                ? "border border-gray-300 text-gray-800 hover:border-gray-500"
                : "border border-gray-200 text-gray-300 line-through cursor-not-allowed"
            }\`}
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}`,
    },
    propsDefinition: `days: { id: string; label: string; slots: Slot[] }[]
selectedSlotId?: string
onSelect: (slotId: string) => void`,
  },
  {
    name: "TipSelector",
    description: "Preset tip chips (10/15/20%) plus a custom amount option.",
    reasoning:
      "Common pattern in delivery / service apps but always built bespoke — chip layout, custom-amount input flow, currency formatting, and zero-tip handling all vary by team. Worth extracting because the same widget will appear on Confirmation, Order History, and Help screens.",
    qualityScore: 88,
    sourceStateNames: ["Order review"],
    usageCount: 1,
    defaultInclude: true,
    previewKey: "tip-selector",
    code: {
      language: "tsx",
      content: `type Preset = { label: string; percent: number };

type Props = {
  subtotal: number;
  presets?: Preset[];
  selectedPercent?: number;
  customAmount?: number;
  onSelectPreset: (percent: number) => void;
  onCustom: (amount: number) => void;
};

const DEFAULT_PRESETS: Preset[] = [
  { label: "10%", percent: 10 },
  { label: "15%", percent: 15 },
  { label: "20%", percent: 20 },
];

export function TipSelector({
  subtotal,
  presets = DEFAULT_PRESETS,
  selectedPercent,
  customAmount,
  onSelectPreset,
  onCustom,
}: Props) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {presets.map((p) => (
        <button
          key={p.percent}
          onClick={() => onSelectPreset(p.percent)}
          className={\`h-9 px-4 rounded-full text-sm font-bold \${
            selectedPercent === p.percent
              ? "bg-amber-400 text-amber-950"
              : "border border-gray-300 text-gray-700"
          }\`}
        >
          {p.label}
        </button>
      ))}
      <CustomAmount value={customAmount} onChange={onCustom} />
    </div>
  );
}`,
    },
    propsDefinition: `subtotal: number
presets?: { label: string; percent: number }[]
selectedPercent?: number
customAmount?: number
onSelectPreset: (percent: number) => void
onCustom: (amount: number) => void`,
  },
  {
    name: "AddressAutocomplete",
    description: "Search field with debounced map-backed dropdown results.",
    reasoning:
      "Wraps Google Places (or equivalent) and exposes a clean parsed-address callback. Always a custom build because every team threads it differently into their address form. Saved-addresses + recent-searches behavior is also product-specific.",
    qualityScore: 85,
    sourceStateNames: ["Shipping address"],
    usageCount: 1,
    defaultInclude: true,
    previewKey: "address-autocomplete",
    code: {
      language: "tsx",
      content: `type Suggestion = {
  placeId: string;
  primary: string;
  secondary: string;
  parsed: { line1: string; city: string; state: string; zip: string };
};

type Props = {
  value: string;
  onChange: (v: string) => void;
  suggestions: Suggestion[];
  loading?: boolean;
  onPick: (s: Suggestion) => void;
};

export function AddressAutocomplete({
  value,
  onChange,
  suggestions,
  loading,
  onPick,
}: Props) {
  return (
    <div className="relative">
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search your address"
        className="h-11 w-full rounded-lg border border-gray-300 px-3.5"
      />
      {value && (suggestions.length > 0 || loading) && (
        <ul className="absolute mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg z-10">
          {suggestions.map((s) => (
            <li
              key={s.placeId}
              onClick={() => onPick(s)}
              className="px-3 py-2 hover:bg-gray-50 cursor-pointer"
            >
              <div className="text-sm font-medium">{s.primary}</div>
              <div className="text-xs text-gray-500">{s.secondary}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}`,
    },
    propsDefinition: `value: string
onChange: (v: string) => void
suggestions: Suggestion[]
loading?: boolean
onPick: (s: Suggestion) => void`,
  },
  {
    name: "PromoCodeChip",
    description:
      "Applied-promo state chip — code, savings amount, and remove control.",
    reasoning:
      "Tiny but distinctive: success-state styling, savings formatting, and remove interaction. Reused on Cart, Order Review, and Order Confirmation. Worth a real component because the styling subtleties (success color, weight contrast, X-button affordance) vary if you eyeball each screen.",
    qualityScore: 82,
    sourceStateNames: ["Cart with items", "Order review"],
    usageCount: 2,
    defaultInclude: true,
    previewKey: "promo-code-chip",
    code: {
      language: "tsx",
      content: `type Props = {
  code: string;
  savings: string;
  onRemove: () => void;
};

export function PromoCodeChip({ code, savings, onRemove }: Props) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1.5">
      <span className="text-xs font-bold text-emerald-700">✓</span>
      <span className="text-xs font-semibold tracking-wide text-emerald-900">
        {code}
      </span>
      <span className="text-xs text-emerald-700">−{savings}</span>
      <button
        onClick={onRemove}
        aria-label="Remove promo"
        className="text-emerald-700/60 hover:text-emerald-900"
      >
        ×
      </button>
    </div>
  );
}`,
    },
    propsDefinition: `code: string
savings: string
onRemove: () => void`,
  },
  {
    name: "PaymentMethodSelector",
    description:
      "Saved-cards picker with selection state and an 'Add new' tile.",
    reasoning:
      "Card-art rendering, selection ring, brand-aware coloring, and add-method affordance. None of this is in a generic DS — it's payment-domain UI that lives between Stripe Elements and your own design language. Reused on Payment + Settings.",
    qualityScore: 80,
    sourceStateNames: ["Payment"],
    usageCount: 1,
    defaultInclude: true,
    previewKey: "payment-method-selector",
    code: {
      language: "tsx",
      content: `type Card = {
  id: string;
  brand: "visa" | "mastercard" | "amex";
  last4: string;
  default?: boolean;
};

type Props = {
  cards: Card[];
  selectedId?: string;
  onSelect: (id: string) => void;
  onAdd: () => void;
};

export function PaymentMethodSelector({
  cards,
  selectedId,
  onSelect,
  onAdd,
}: Props) {
  return (
    <div className="flex gap-2.5 overflow-x-auto pb-1">
      {cards.map((c) => (
        <button
          key={c.id}
          onClick={() => onSelect(c.id)}
          className={\`flex h-20 w-32 flex-col justify-end rounded-lg p-2.5 text-left text-white \${
            c.id === selectedId
              ? "ring-2 ring-indigo-500"
              : "ring-1 ring-transparent"
          } \${BRAND_BG[c.brand]}\`}
        >
          <div className="text-[10px] uppercase tracking-wider opacity-70">
            {c.brand}
          </div>
          <div className="text-sm font-semibold">•••• {c.last4}</div>
        </button>
      ))}
      <button
        onClick={onAdd}
        className="flex h-20 w-32 flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-gray-300 text-gray-500 hover:border-gray-400"
      >
        <span className="text-xl leading-none">+</span>
        <span className="text-xs font-medium">Add card</span>
      </button>
    </div>
  );
}`,
    },
    propsDefinition: `cards: { id: string; brand: "visa" | "mastercard" | "amex"; last4: string; default?: boolean }[]
selectedId?: string
onSelect: (id: string) => void
onAdd: () => void`,
  },
  {
    name: "OrderProgressTracker",
    description:
      "Multi-step status bar — Placed → Preparing → Out → Delivered.",
    reasoning:
      "Stepper with semantic states (complete / current / upcoming) and timestamps. Reused on Order Confirmation, Order Detail, and Notification surfaces. Not a primitive any DS will ship — too domain-specific.",
    qualityScore: 78,
    sourceStateNames: ["Order confirmed"],
    usageCount: 1,
    defaultInclude: true,
    previewKey: "order-progress-tracker",
    code: {
      language: "tsx",
      content: `type Step = { label: string; ts?: string };

type Props = {
  steps: Step[];
  /** Index of the currently-active step. All before are 'complete'. */
  currentIndex: number;
};

export function OrderProgressTracker({ steps, currentIndex }: Props) {
  return (
    <div>
      <div className="relative flex items-center justify-between">
        <div className="absolute left-3 right-3 top-1/2 h-px -translate-y-1/2 bg-gray-200" />
        <div
          className="absolute left-3 top-1/2 h-px -translate-y-1/2 bg-emerald-500"
          style={{ width: \`\${(currentIndex / (steps.length - 1)) * 100}%\` }}
        />
        {steps.map((_, i) => (
          <div
            key={i}
            className={\`relative z-10 h-3 w-3 rounded-full \${
              i <= currentIndex
                ? "bg-emerald-500 ring-4 ring-emerald-500/20"
                : "bg-gray-200"
            }\`}
          />
        ))}
      </div>
      <div className="mt-2 flex justify-between text-[10px] uppercase tracking-wider">
        {steps.map((s, i) => (
          <span
            key={s.label}
            className={i <= currentIndex ? "text-emerald-700" : "text-gray-400"}
          >
            {s.label}
          </span>
        ))}
      </div>
    </div>
  );
}`,
    },
    propsDefinition: `steps: { label: string; ts?: string }[]
currentIndex: number`,
  },
  {
    name: "ItemRecommender",
    description:
      '"Customers also bought" carousel of mini product cards.',
    reasoning:
      "Reuses across Cart, Empty Cart, Order Confirmation. Mini product card structure (image, name, price, add-to-cart) is consistent. Worth its own component because the data binding (recs from API + tracking) is shared.",
    qualityScore: 74,
    sourceStateNames: ["Cart with items", "Order confirmed"],
    usageCount: 2,
    defaultInclude: true,
    previewKey: "item-recommender",
    code: {
      language: "tsx",
      content: `type Item = {
  id: string;
  image: string;
  name: string;
  price: string;
};

type Props = {
  title?: string;
  items: Item[];
  onAdd: (id: string) => void;
};

export function ItemRecommender({
  title = "Customers also bought",
  items,
  onAdd,
}: Props) {
  return (
    <section className="space-y-2">
      <h3 className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
        {title}
      </h3>
      <ul className="flex gap-2 overflow-x-auto pb-1">
        {items.map((it) => (
          <li
            key={it.id}
            className="w-28 shrink-0 rounded-lg border border-gray-200 p-1.5"
          >
            <img src={it.image} alt={it.name} className="h-16 w-full rounded-md object-cover" />
            <div className="mt-1 truncate text-xs font-medium">{it.name}</div>
            <div className="mt-0.5 flex items-center justify-between">
              <span className="text-xs font-semibold">{it.price}</span>
              <button
                onClick={() => onAdd(it.id)}
                className="rounded-full bg-indigo-600 px-2 py-0.5 text-[10px] font-semibold text-white"
              >
                Add
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}`,
    },
    propsDefinition: `title?: string
items: { id: string; image: string; name: string; price: string }[]
onAdd: (id: string) => void`,
  },
  {
    name: "PrimaryButton",
    description: "Generic filled CTA used across all checkout steps.",
    reasoning:
      "Your design system almost certainly already has a primary button. Extracting another one would create drift and you'll regret it in 3 months. **Skip** unless your team is genuinely starting a DS from scratch.",
    qualityScore: 42,
    sourceStateNames: [
      "Cart with items",
      "Shipping address",
      "Payment",
      "Order review",
      "Order confirmed",
    ],
    usageCount: 5,
    defaultInclude: false,
    previewKey: "primary-button",
    code: {
      language: "tsx",
      content: `// Likely a duplicate of your existing DS Button — review before adopting.
export function PrimaryButton({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="h-12 px-5 rounded-lg bg-indigo-600 text-white font-semibold">
      {children}
    </button>
  );
}`,
    },
    propsDefinition: `children: ReactNode
onClick?: () => void`,
  },
  {
    name: "FormField",
    description: "Label + input pair used across address and payment forms.",
    reasoning:
      "Same as PrimaryButton — your DS likely already has a form-field primitive. Extracting another would diverge from your input conventions (validation rules, mask logic, autofill annotations). **Skip** unless you're greenfield.",
    qualityScore: 38,
    sourceStateNames: ["Shipping address", "Payment"],
    usageCount: 6,
    defaultInclude: false,
    previewKey: "form-field",
    code: {
      language: "tsx",
      content: `// Likely a duplicate of your DS form field. Review before adopting.
export function FormField({ label, value, onChange }: { label: string; value: string; onChange?: (v: string) => void }) {
  return (
    <label className="block mb-3">
      <span className="block text-xs text-gray-500 mb-1">{label}</span>
      <input value={value} onChange={(e) => onChange?.(e.target.value)} className="w-full h-10 rounded-md border border-gray-300 px-3" />
    </label>
  );
}`,
    },
    propsDefinition: `label: string
value: string
onChange?: (v: string) => void`,
  },
];

const fallbackCandidates: Omit<ExtractedComponent, "id">[] = [
  {
    name: "PromoCodeChip",
    description: "Applied-promo state chip with remove control.",
    reasoning:
      "Custom state component — success styling + savings formatting + remove. Worth extracting.",
    qualityScore: 84,
    sourceStateNames: ["—"],
    usageCount: 2,
    defaultInclude: true,
    previewKey: "promo-code-chip",
    code: {
      language: "tsx",
      content: `export function PromoCodeChip({ code, onRemove }: { code: string; onRemove: () => void }) {
  return <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-900">✓ {code} <button onClick={onRemove}>×</button></span>;
}`,
    },
    propsDefinition: `code: string
onRemove: () => void`,
  },
  {
    name: "ItemRecommender",
    description: "Mini product cards carousel.",
    reasoning:
      "Reusable across surfaces with consistent product-card structure.",
    qualityScore: 76,
    sourceStateNames: ["—"],
    usageCount: 2,
    defaultInclude: true,
    previewKey: "item-recommender",
    code: {
      language: "tsx",
      content: `export function ItemRecommender({ items }: { items: { id: string; name: string; price: string; image: string }[] }) {
  return <ul className="flex gap-2 overflow-x-auto">{items.map(i => <li key={i.id}>{i.name} {i.price}</li>)}</ul>;
}`,
    },
    propsDefinition: `items: { id: string; name: string; price: string; image: string }[]`,
  },
  {
    name: "PrimaryButton",
    description: "Generic CTA — likely a duplicate of your DS.",
    reasoning:
      "Your design system likely already has this primitive. Skip unless greenfield.",
    qualityScore: 38,
    sourceStateNames: ["—"],
    usageCount: 4,
    defaultInclude: false,
    previewKey: "primary-button",
    code: {
      language: "tsx",
      content: `export function PrimaryButton(p: any) { return <button {...p} className="h-12 px-5 rounded-lg bg-indigo-600 text-white font-semibold" />; }`,
    },
    propsDefinition: `children: ReactNode
onClick?: () => void`,
  },
];

/** Returns a Space-specific candidate set, falling back to a generic one. */
export function getMockCandidatesForSpace(spaceId: string): Omit<
  ExtractedComponent,
  "id"
>[] {
  if (spaceId === "space-1") return checkoutCandidates;
  return fallbackCandidates;
}
