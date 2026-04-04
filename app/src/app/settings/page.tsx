"use client";

import { Settings } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="flex h-full flex-col overflow-auto">
      <div className="mx-auto w-full max-w-3xl px-8 py-12">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold">Settings</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your account and preferences
          </p>
        </div>

        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Settings size={32} className="text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground">
            Settings page coming soon
          </p>
        </div>
      </div>
    </div>
  );
}
