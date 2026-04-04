"use client";

import {
  Hexagon,
  FileText,
  BarChart3,
  Users,
  Lightbulb,
  SwatchBook,
  Upload,
  Globe,
  FileSpreadsheet,
  PenTool,
  Monitor,
  Camera,
  ArrowUpFromLine,
  GitBranch,
} from "lucide-react";
import { useKnowledgeStore } from "@/stores/useKnowledgeStore";
import type { KnowledgeCategory } from "@/types";
import { useRouter } from "next/navigation";

const categories: {
  id: KnowledgeCategory;
  label: string;
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}[] = [
  {
    id: "about-company",
    label: "About Company",
    description: "Company description, mission, brand guidelines, tone of voice",
    icon: Hexagon,
  },
  {
    id: "feature-specs",
    label: "Feature Specs",
    description: "Shipped feature documentation & specifications",
    icon: FileText,
  },
  {
    id: "business-logic",
    label: "Business Logic",
    description: "Rules, workflows, constraints & edge cases",
    icon: BarChart3,
  },
  {
    id: "customers-personas",
    label: "Customers & Personas",
    description: "User research, personas, pain points & needs",
    icon: Users,
  },
  {
    id: "product-decisions",
    label: "Product Decisions",
    description: "Past decisions & rationale, trade-offs",
    icon: Lightbulb,
  },
  {
    id: "design-system",
    label: "Design System",
    description: "Colors, typography, spacing, components & patterns",
    icon: SwatchBook,
  },
];

const inputMethods = [
  { icon: Upload, label: "Upload files", description: "PDF, images, docs" },
  { icon: Globe, label: "Website link", description: "Paste a URL" },
  { icon: FileText, label: "Google Docs", description: "Import documents" },
  {
    icon: FileSpreadsheet,
    label: "Google Sheets",
    description: "Import spreadsheets",
  },
  { icon: PenTool, label: "Figma", description: "Import frames & tokens" },
  { icon: GitBranch, label: "GitHub", description: "Connect repos & code" },
  { icon: Monitor, label: "Record screen", description: "Capture walkthrough" },
  { icon: Camera, label: "Capture screen", description: "Screenshot" },
  {
    icon: ArrowUpFromLine,
    label: "Push from space",
    description: "Promote space outputs",
  },
];

export default function KnowledgePage() {
  const { getCategoryCount } = useKnowledgeStore();
  const router = useRouter();

  return (
    <div className="flex h-full flex-col overflow-auto">
      <div className="mx-auto w-full max-w-4xl px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold">Product Knowledge</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Your product&apos;s source of truth — shared across all spaces
          </p>
        </div>

        {/* Category Grid */}
        <div className="grid grid-cols-3 gap-4 mb-12">
          {categories.map((cat) => {
            const count = getCategoryCount(cat.id);
            return (
              <button
                key={cat.id}
                onClick={() => router.push(`/knowledge/${cat.id}`)}
                className="flex flex-col items-start gap-3 rounded-xl border border-border bg-surface-2 p-5 hover:border-primary/30 hover:bg-surface-3 transition-all text-left group"
              >
                <div className="flex items-center gap-2">
                  <cat.icon
                    size={18}
                    className="text-muted-foreground group-hover:text-primary transition-colors"
                  />
                  <span className="text-sm font-medium group-hover:text-foreground">
                    {cat.label}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {cat.description}
                </p>
                <span className="text-xs text-muted-foreground mt-auto">
                  {count} {count === 1 ? "document" : "documents"}
                </span>
              </button>
            );
          })}
        </div>

        {/* Input Methods */}
        <div>
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
            How to add knowledge
          </h2>
          <div className="grid grid-cols-4 gap-3">
            {inputMethods.map((method) => (
              <button
                key={method.label}
                className="flex items-center gap-3 rounded-lg border border-border bg-surface-2 px-4 py-3 hover:border-primary/30 hover:bg-surface-3 transition-all group"
              >
                <method.icon
                  size={16}
                  className="shrink-0 text-muted-foreground group-hover:text-primary transition-colors"
                />
                <div className="text-left">
                  <p className="text-sm font-medium">{method.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {method.description}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
