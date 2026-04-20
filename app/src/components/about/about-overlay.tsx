"use client";

import { useEffect, useRef, useState } from "react";
import { Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { aboutSections, SectionRenderer } from "./about-content";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function AboutOverlay({ open, onOpenChange }: Props) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [activeId, setActiveId] = useState<string>(aboutSections[0]?.id ?? "");

  // Reset scroll position to top whenever the overlay reopens.
  useEffect(() => {
    if (!open) return;
    const id = requestAnimationFrame(() => {
      if (scrollRef.current) scrollRef.current.scrollTop = 0;
      setActiveId(aboutSections[0]?.id ?? "");
    });
    return () => cancelAnimationFrame(id);
  }, [open]);

  // Scroll-spy: highlight the section currently nearest the top of the
  // reading column. We use IntersectionObserver scoped to the scroll root
  // and pick the section whose top sits within the upper third of the view.
  useEffect(() => {
    if (!open) return;
    const root = scrollRef.current;
    if (!root) return;

    const sectionEls = aboutSections
      .map((s) => root.querySelector<HTMLElement>(`[data-section-id="${s.id}"]`))
      .filter((el): el is HTMLElement => el !== null);

    if (sectionEls.length === 0) return;

    // Top of "active" zone = 0; bottom = ~33% of viewport. Anything whose
    // top crosses this band becomes the active one.
    const observer = new IntersectionObserver(
      (entries) => {
        // Track the entry with the smallest positive top (closest to active band).
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort(
            (a, b) =>
              Math.abs(a.boundingClientRect.top) - Math.abs(b.boundingClientRect.top),
          );
        if (visible[0]) {
          const id = visible[0].target.getAttribute("data-section-id");
          if (id) setActiveId(id);
        }
      },
      {
        root,
        // Only count a section as "active" once its top enters the upper
        // third of the scroll viewport.
        rootMargin: "0px 0px -66% 0px",
        threshold: 0,
      },
    );

    sectionEls.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [open]);

  const handleRailClick = (id: string) => {
    const root = scrollRef.current;
    if (!root) return;
    const target = root.querySelector<HTMLElement>(`[data-section-id="${id}"]`);
    if (!target) return;
    // Smooth scroll within the bounded scroll container, not the page.
    root.scrollTo({ top: target.offsetTop - 12, behavior: "smooth" });
    setActiveId(id);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className="w-[min(1040px,calc(100vw-3rem))] max-w-[min(1040px,calc(100vw-3rem))] h-[min(720px,calc(100vh-3rem))] gap-0 p-0 sm:max-w-[min(1040px,calc(100vw-3rem))] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex shrink-0 items-center gap-2 border-b border-white/[0.06] px-5 py-3.5">
          <Sparkles size={14} strokeWidth={1.8} className="text-[#695be8]" />
          <DialogTitle className="text-[13.5px] font-medium text-foreground">
            What's in this prototype
          </DialogTitle>
          <span className="text-[11.5px] text-foreground/40">— a self-guided tour</span>
        </div>

        {/* Two-column body */}
        <div className="flex min-h-0 flex-1">
          {/* Left rail — scroll-spy nav */}
          <nav className="hidden w-[210px] shrink-0 flex-col gap-0.5 overflow-y-auto border-r border-white/[0.06] bg-white/[0.015] p-3 sm:flex">
            <span className="px-2 pb-1.5 pt-1 text-[9.5px] font-semibold uppercase tracking-wider text-foreground/35">
              On this page
            </span>
            {aboutSections.map((s) => {
              const isActive = activeId === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => handleRailClick(s.id)}
                  className={cn(
                    "group flex items-baseline gap-2 rounded px-2 py-1.5 text-left text-[12px] transition-colors",
                    isActive
                      ? "bg-white/[0.06] text-foreground"
                      : "text-foreground/55 hover:bg-white/[0.03] hover:text-foreground/80",
                  )}
                >
                  <span
                    className={cn(
                      "shrink-0 font-mono text-[10px]",
                      isActive ? "text-[#8c83ee]" : "text-foreground/30",
                    )}
                  >
                    {s.number}
                  </span>
                  <span className="truncate">{s.title}</span>
                </button>
              );
            })}
          </nav>

          {/* Right column — scrollable reading area */}
          <div
            ref={scrollRef}
            className="min-w-0 flex-1 overflow-y-auto px-6 py-2 sm:px-10"
          >
            <div className="mx-auto max-w-[640px]">
              {aboutSections.map((s, i) => (
                <div key={s.id}>
                  <SectionRenderer
                    section={s}
                    onCtaClick={() => onOpenChange(false)}
                  />
                  {i < aboutSections.length - 1 && (
                    <div className="h-px w-full bg-white/[0.06]" />
                  )}
                </div>
              ))}
              <p className="py-8 text-center text-[10.5px] text-foreground/30">
                — end —
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
