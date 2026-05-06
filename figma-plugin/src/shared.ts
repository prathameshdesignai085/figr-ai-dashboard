export type HandoverBundleState = {
  id: string;
  name: string;
  group?: string;
  /** base64 PNG data URL — may include the `data:image/png;base64,` prefix. */
  dataUrl: string;
};

export type HandoverBundle = {
  slug: string;
  sectionName: string;
  states: HandoverBundleState[];
};

/** UI iframe → main thread (figma.*). */
export type UiToCodeMessage =
  | { kind: "save-token"; token: string }
  | { kind: "clear-token" }
  | { kind: "build-section"; bundle: HandoverBundle }
  | { kind: "notify"; message: string; error?: boolean };

/** Main thread → UI iframe. */
export type CodeToUiMessage =
  | { kind: "init"; sessionToken: string | null; lastPullAt: string | null }
  | {
      kind: "section-created";
      sectionId: string;
      sectionUrl: string | null;
      slug: string;
      lastPullAt: string;
    }
  | { kind: "section-error"; message: string };
