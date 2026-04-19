import { Monitor, Smartphone, Layers } from "lucide-react";
import type { TargetPlatform } from "@/types";

/** Resolves the lucide icon for a platform without re-creating a component on each render. */
export function PlatformIcon({
  platform,
  size,
  className,
}: {
  platform: TargetPlatform;
  size?: number;
  className?: string;
}) {
  if (platform === "mobile") return <Smartphone size={size} className={className} />;
  if (platform === "universal") return <Layers size={size} className={className} />;
  return <Monitor size={size} className={className} />;
}

export const platformOptions: {
  id: TargetPlatform;
  label: string;
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}[] = [
  {
    id: "web",
    label: "Web",
    description: "Responsive web app — Next.js / React",
    icon: Monitor,
  },
  {
    id: "mobile",
    label: "Mobile",
    description: "Native feel — Expo / React Native, scan to run on phone",
    icon: Smartphone,
  },
  {
    id: "universal",
    label: "Universal",
    description: "Both — generate web + mobile variants side by side",
    icon: Layers,
  },
];

export const platformBadgeColors: Record<TargetPlatform, string> = {
  web: "bg-sky-400/10 text-sky-400",
  mobile: "bg-violet-400/10 text-violet-400",
  universal: "bg-fuchsia-400/10 text-fuchsia-400",
};

export function platformIcon(platform: TargetPlatform) {
  return platformOptions.find((o) => o.id === platform)?.icon ?? Monitor;
}

export function platformLabel(platform: TargetPlatform): string {
  return platformOptions.find((o) => o.id === platform)?.label ?? platform;
}
