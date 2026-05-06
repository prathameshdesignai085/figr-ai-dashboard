"use client";

import * as React from "react";

/**
 * 6 mobile mock screens used to seed realistic captured states for a
 * Checkout Redesign demo. Each screen is fixed at iPhone-ish dimensions
 * (375 x 720) so the resulting PNGs land in Figma at recognizable sizes.
 *
 * These are deliberately self-contained inline styles (no Tailwind utility
 * classes) so html-to-image renders them without needing to inline the
 * project's CSS. Keeps captures consistent regardless of theme.
 */

const W = 375;
const H = 720;

const SHELL: React.CSSProperties = {
  width: W,
  height: H,
  background: "#ffffff",
  fontFamily: "-apple-system, BlinkMacSystemFont, Inter, system-ui, sans-serif",
  display: "flex",
  flexDirection: "column",
  color: "#111827",
  position: "relative",
  overflow: "hidden",
};

const STATUS_BAR: React.CSSProperties = {
  height: 36,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "0 20px",
  fontSize: 12,
  fontWeight: 600,
  color: "#111827",
};

const NAV: React.CSSProperties = {
  height: 52,
  borderBottom: "1px solid #f3f4f6",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "0 16px",
};

const TITLE: React.CSSProperties = {
  fontSize: 17,
  fontWeight: 600,
};

const CTA_PRIMARY: React.CSSProperties = {
  height: 52,
  borderRadius: 12,
  background: "#4f46e5",
  color: "#fff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 15,
  fontWeight: 600,
  margin: "0 16px 24px 16px",
};

const CTA_SECONDARY: React.CSSProperties = {
  ...CTA_PRIMARY,
  background: "#f3f4f6",
  color: "#111827",
};

function StatusBar() {
  return (
    <div style={STATUS_BAR}>
      <span>9:41</span>
      <span style={{ display: "flex", gap: 4, alignItems: "center" }}>
        <span style={{ fontSize: 10 }}>●●●●●</span>
        <span style={{ fontSize: 10 }}>5G</span>
        <span
          style={{
            width: 22,
            height: 11,
            border: "1px solid #111827",
            borderRadius: 3,
            position: "relative",
          }}
        >
          <span
            style={{
              position: "absolute",
              inset: 1,
              background: "#111827",
              borderRadius: 1,
            }}
          />
        </span>
      </span>
    </div>
  );
}

function NavBar({ title, leading = "←" }: { title: string; leading?: string }) {
  return (
    <div style={NAV}>
      <span style={{ fontSize: 22, color: "#374151" }}>{leading}</span>
      <span style={TITLE}>{title}</span>
      <span style={{ width: 22 }} />
    </div>
  );
}

// 1. Empty cart -------------------------------------------------------------
function EmptyCart() {
  return (
    <div style={SHELL}>
      <StatusBar />
      <NavBar title="Cart" leading="✕" />
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
          textAlign: "center",
          gap: 16,
        }}
      >
        <div
          style={{
            width: 96,
            height: 96,
            borderRadius: 999,
            background: "#eef2ff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 36,
          }}
        >
          🛒
        </div>
        <div>
          <div style={{ fontSize: 20, fontWeight: 600, marginBottom: 6 }}>
            Your cart is empty
          </div>
          <div
            style={{
              fontSize: 14,
              color: "#6b7280",
              maxWidth: 280,
              lineHeight: 1.4,
            }}
          >
            Browse our latest collection and add items you love.
          </div>
        </div>
      </div>
      <div style={CTA_PRIMARY}>Start shopping</div>
    </div>
  );
}

// 2. Cart with items --------------------------------------------------------
function CartWithItems() {
  return (
    <div style={SHELL}>
      <StatusBar />
      <NavBar title="Cart · 2 items" leading="✕" />
      <div style={{ flex: 1, padding: "12px 16px", overflow: "auto" }}>
        {[
          { name: "Walnut side table", price: 249, qty: 1 },
          { name: "Linen throw blanket", price: 89, qty: 1 },
        ].map((item, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              gap: 12,
              padding: "12px 0",
              borderBottom: "1px solid #f3f4f6",
            }}
          >
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: 8,
                background: i === 0 ? "#fef3c7" : "#dcfce7",
              }}
            />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{item.name}</div>
              <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>
                Qty {item.qty}
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, marginTop: 6 }}>
                ${item.price.toFixed(2)}
              </div>
            </div>
          </div>
        ))}
        <div
          style={{
            marginTop: 16,
            padding: 14,
            borderRadius: 12,
            background: "#f9fafb",
          }}
        >
          {[
            ["Subtotal", "$338.00"],
            ["Shipping", "Free"],
            ["Tax", "$28.16"],
          ].map(([k, v]) => (
            <div
              key={k}
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 13,
                color: "#374151",
                marginBottom: 6,
              }}
            >
              <span>{k}</span>
              <span>{v}</span>
            </div>
          ))}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 16,
              fontWeight: 700,
              marginTop: 8,
              paddingTop: 8,
              borderTop: "1px solid #e5e7eb",
            }}
          >
            <span>Total</span>
            <span>$366.16</span>
          </div>
        </div>
      </div>
      <div style={CTA_PRIMARY}>Checkout</div>
    </div>
  );
}

// 3. Address step -----------------------------------------------------------
function AddressStep() {
  return (
    <div style={SHELL}>
      <StatusBar />
      <NavBar title="Shipping" />
      <div
        style={{
          padding: "8px 16px 0",
          fontSize: 11,
          color: "#6b7280",
          textTransform: "uppercase",
          letterSpacing: 0.6,
          fontWeight: 600,
        }}
      >
        Step 1 of 3
      </div>
      <div style={{ padding: "12px 16px", flex: 1 }}>
        {[
          { label: "Full name", value: "Alex Park" },
          { label: "Street", value: "742 Evergreen Ter" },
          { label: "City", value: "Springfield" },
          { label: "State / Zip", value: "OR · 97214" },
          { label: "Phone", value: "(555) 010-2024" },
        ].map((field) => (
          <div key={field.label} style={{ marginBottom: 12 }}>
            <div
              style={{
                fontSize: 11,
                color: "#6b7280",
                marginBottom: 6,
                fontWeight: 500,
              }}
            >
              {field.label}
            </div>
            <div
              style={{
                height: 44,
                borderRadius: 10,
                border: "1px solid #d1d5db",
                padding: "0 14px",
                display: "flex",
                alignItems: "center",
                fontSize: 14,
                color: "#111827",
              }}
            >
              {field.value}
            </div>
          </div>
        ))}
      </div>
      <div style={CTA_PRIMARY}>Continue to payment</div>
    </div>
  );
}

// 4. Payment step -----------------------------------------------------------
function PaymentStep() {
  const wallets = [
    { label: " Pay", bg: "#000" },
    { label: "G Pay", bg: "#fff", border: "1px solid #e5e7eb", color: "#111" },
    { label: "PayPal", bg: "#0070ba" },
  ];
  return (
    <div style={SHELL}>
      <StatusBar />
      <NavBar title="Payment" />
      <div
        style={{
          padding: "8px 16px 0",
          fontSize: 11,
          color: "#6b7280",
          textTransform: "uppercase",
          letterSpacing: 0.6,
          fontWeight: 600,
        }}
      >
        Step 2 of 3
      </div>
      <div style={{ padding: "12px 16px", flex: 1 }}>
        <div
          style={{
            fontSize: 13,
            color: "#374151",
            marginBottom: 8,
            fontWeight: 600,
          }}
        >
          Express checkout
        </div>
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          {wallets.map((w, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                height: 48,
                borderRadius: 10,
                background: w.bg,
                color: w.color ?? "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 13,
                fontWeight: 600,
                border: w.border ?? "none",
              }}
            >
              {w.label}
            </div>
          ))}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            margin: "8px 0 16px",
          }}
        >
          <div style={{ flex: 1, height: 1, background: "#e5e7eb" }} />
          <span style={{ fontSize: 11, color: "#9ca3af" }}>OR PAY WITH CARD</span>
          <div style={{ flex: 1, height: 1, background: "#e5e7eb" }} />
        </div>
        {[
          { label: "Card number", value: "•••• •••• •••• 4242" },
          { label: "Name on card", value: "Alex Park" },
        ].map((f) => (
          <div key={f.label} style={{ marginBottom: 12 }}>
            <div
              style={{
                fontSize: 11,
                color: "#6b7280",
                marginBottom: 6,
                fontWeight: 500,
              }}
            >
              {f.label}
            </div>
            <div
              style={{
                height: 44,
                borderRadius: 10,
                border: "1px solid #d1d5db",
                padding: "0 14px",
                display: "flex",
                alignItems: "center",
                fontSize: 14,
              }}
            >
              {f.value}
            </div>
          </div>
        ))}
        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontSize: 11,
                color: "#6b7280",
                marginBottom: 6,
                fontWeight: 500,
              }}
            >
              Expiry
            </div>
            <div
              style={{
                height: 44,
                borderRadius: 10,
                border: "1px solid #d1d5db",
                padding: "0 14px",
                display: "flex",
                alignItems: "center",
                fontSize: 14,
              }}
            >
              09 / 28
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontSize: 11,
                color: "#6b7280",
                marginBottom: 6,
                fontWeight: 500,
              }}
            >
              CVC
            </div>
            <div
              style={{
                height: 44,
                borderRadius: 10,
                border: "1px solid #d1d5db",
                padding: "0 14px",
                display: "flex",
                alignItems: "center",
                fontSize: 14,
              }}
            >
              ●●●
            </div>
          </div>
        </div>
      </div>
      <div style={CTA_PRIMARY}>Review order</div>
    </div>
  );
}

// 5. Order review -----------------------------------------------------------
function OrderReview() {
  return (
    <div style={SHELL}>
      <StatusBar />
      <NavBar title="Review" />
      <div
        style={{
          padding: "8px 16px 0",
          fontSize: 11,
          color: "#6b7280",
          textTransform: "uppercase",
          letterSpacing: 0.6,
          fontWeight: 600,
        }}
      >
        Step 3 of 3
      </div>
      <div style={{ padding: "12px 16px", flex: 1, overflow: "auto" }}>
        <SectionRow label="Ship to" value="Alex Park · 742 Evergreen Ter" />
        <SectionRow label="Pay with" value="Visa •••• 4242" />
        <SectionRow label="Items" value="2 items · 1 box" />
        <div
          style={{
            marginTop: 16,
            padding: 14,
            borderRadius: 12,
            background: "#f9fafb",
          }}
        >
          {[
            ["Subtotal", "$338.00"],
            ["Shipping", "Free"],
            ["Tax", "$28.16"],
          ].map(([k, v]) => (
            <div
              key={k}
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 13,
                color: "#374151",
                marginBottom: 6,
              }}
            >
              <span>{k}</span>
              <span>{v}</span>
            </div>
          ))}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 18,
              fontWeight: 700,
              marginTop: 8,
              paddingTop: 8,
              borderTop: "1px solid #e5e7eb",
            }}
          >
            <span>Total</span>
            <span>$366.16</span>
          </div>
        </div>
        <div
          style={{
            marginTop: 16,
            fontSize: 11,
            color: "#6b7280",
            lineHeight: 1.5,
          }}
        >
          By placing your order you agree to our Terms and acknowledge our
          Privacy Policy.
        </div>
      </div>
      <div style={CTA_PRIMARY}>Place order</div>
    </div>
  );
}

function SectionRow({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "12px 0",
        borderBottom: "1px solid #f3f4f6",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <div style={{ fontSize: 11, color: "#6b7280", fontWeight: 500 }}>
          {label}
        </div>
        <div style={{ fontSize: 14, color: "#111827" }}>{value}</div>
      </div>
      <span style={{ fontSize: 12, color: "#4f46e5", fontWeight: 600 }}>
        Edit
      </span>
    </div>
  );
}

// 6. Order confirmed --------------------------------------------------------
function OrderConfirmed() {
  return (
    <div style={SHELL}>
      <StatusBar />
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
          textAlign: "center",
          gap: 16,
        }}
      >
        <div
          style={{
            width: 96,
            height: 96,
            borderRadius: 999,
            background: "#dcfce7",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 48,
            color: "#16a34a",
          }}
        >
          ✓
        </div>
        <div>
          <div style={{ fontSize: 22, fontWeight: 600, marginBottom: 6 }}>
            Order placed!
          </div>
          <div
            style={{
              fontSize: 14,
              color: "#6b7280",
              maxWidth: 280,
              lineHeight: 1.4,
            }}
          >
            Confirmation #A4F-3318 sent to alex@example.com. Tracking will
            email shortly.
          </div>
        </div>
        <div
          style={{
            marginTop: 8,
            padding: "10px 14px",
            background: "#f3f4f6",
            borderRadius: 999,
            fontSize: 12,
            color: "#374151",
          }}
        >
          Estimated delivery · Tue, May 12
        </div>
      </div>
      <div style={CTA_SECONDARY}>View order</div>
      <div style={{ ...CTA_PRIMARY, marginTop: -16 }}>Back to shop</div>
    </div>
  );
}

// Public registry -----------------------------------------------------------

export type DemoScreen = {
  name: string;
  group: string;
  /** Renders the mock at fixed mobile dimensions. */
  Component: React.ComponentType;
};

export const DEMO_SCREENS: DemoScreen[] = [
  { name: "Empty cart", group: "Cart flow", Component: EmptyCart },
  { name: "Cart with items", group: "Cart flow", Component: CartWithItems },
  { name: "Shipping address", group: "Checkout", Component: AddressStep },
  { name: "Payment", group: "Checkout", Component: PaymentStep },
  { name: "Order review", group: "Checkout", Component: OrderReview },
  { name: "Order confirmed", group: "Done", Component: OrderConfirmed },
];

export const DEMO_SCREEN_DIMENSIONS = { width: W, height: H } as const;
