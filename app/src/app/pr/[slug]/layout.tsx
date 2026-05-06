// Minimal layout for public PR pages — matches /h/[slug]/layout.tsx.
export default function PrLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground">{children}</div>
  );
}
