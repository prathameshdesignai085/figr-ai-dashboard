import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { nanoid } from "nanoid";
import type { CapturedState } from "@/types";

type AddCapturedStateInput = Omit<CapturedState, "id" | "capturedAt">;

interface HandoverState {
  capturedStates: CapturedState[];
  addCapturedState: (input: AddCapturedStateInput) => CapturedState;
  removeCapturedState: (id: string) => void;
  renameCapturedState: (id: string, name: string) => void;
  getStatesForSpace: (spaceId: string) => CapturedState[];
  clearStatesForSpace: (spaceId: string) => void;
}

export const useHandoverStore = create<HandoverState>()(
  persist(
    (set, get) => ({
      capturedStates: [],

      addCapturedState: (input) => {
        const state: CapturedState = {
          ...input,
          id: `cap-${nanoid(8)}`,
          capturedAt: new Date().toISOString(),
        };
        set((s) => ({ capturedStates: [...s.capturedStates, state] }));
        return state;
      },

      removeCapturedState: (id) => {
        set((s) => ({
          capturedStates: s.capturedStates.filter((c) => c.id !== id),
        }));
      },

      renameCapturedState: (id, name) => {
        set((s) => ({
          capturedStates: s.capturedStates.map((c) =>
            c.id === id ? { ...c, name } : c
          ),
        }));
      },

      getStatesForSpace: (spaceId) =>
        get().capturedStates.filter((c) => c.spaceId === spaceId),

      clearStatesForSpace: (spaceId) => {
        set((s) => ({
          capturedStates: s.capturedStates.filter((c) => c.spaceId !== spaceId),
        }));
      },
    }),
    {
      name: "figred-handover",
      // Captures contain base64 PNGs which can be large — keep them in localStorage
      // for now (~5MB cap is plenty for a few states). Phase 3 swaps in real persistence.
      storage: createJSONStorage(() => localStorage),
      version: 1,
    }
  )
);
