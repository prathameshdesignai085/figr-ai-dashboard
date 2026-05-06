// Minimal layout for public handover pages. The app-shell at
// /Users/pratea/Documents/ai explorations repos/figred/app/src/components/layout/app-shell.tsx
// already bypasses workspace chrome for /h/* routes, so this layout just
// provides the dark page surface.
export default function HandoverLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground">{children}</div>
  );
}
