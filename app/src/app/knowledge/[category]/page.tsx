"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, FileText, Globe, Table2, PenTool, Plus } from "lucide-react";
import { useKnowledgeStore } from "@/stores/useKnowledgeStore";
import type { KnowledgeCategory } from "@/types";

const categoryLabels: Record<KnowledgeCategory, string> = {
  "about-company": "About Company",
  "feature-specs": "Feature Specs",
  "business-logic": "Business Logic",
  "customers-personas": "Customers & Personas",
  "product-decisions": "Product Decisions",
  "design-system": "Design System",
};

const sourceIcons: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  upload: FileText,
  "google-docs": FileText,
  "google-sheets": Table2,
  figma: PenTool,
  website: Globe,
};

export default function KnowledgeCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = use(params);
  const router = useRouter();
  const { getItemsByCategory } = useKnowledgeStore();

  const catId = category as KnowledgeCategory;
  const label = categoryLabels[catId] || category;
  const items = getItemsByCategory(catId);

  return (
    <div className="flex h-full flex-col overflow-auto">
      <div className="mx-auto w-full max-w-3xl px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push("/knowledge")}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft size={14} />
            <span>Product Knowledge</span>
          </button>
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold">{label}</h1>
            <button className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/80 transition-colors">
              <Plus size={14} />
              <span>Add document</span>
            </button>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {items.length} {items.length === 1 ? "document" : "documents"}
          </p>
        </div>

        {/* Items List */}
        <div className="space-y-2">
          {items.map((item) => {
            const SourceIcon = sourceIcons[item.source] || FileText;
            return (
              <div
                key={item.id}
                className="flex items-center gap-3 rounded-lg border border-border bg-surface-2 px-4 py-3 hover:border-primary/30 hover:bg-surface-3 transition-all cursor-pointer"
              >
                <SourceIcon size={16} className="shrink-0 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {item.source.replace("-", " ")}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(item.addedAt).toLocaleDateString()}
                </span>
              </div>
            );
          })}
        </div>

        {items.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <FileText size={32} className="text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">
              No documents yet. Add your first one to get started.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
