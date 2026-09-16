import { create } from "zustand";
import { persist } from "zustand/middleware";

export type AdminMode = "easy" | "advanced";

type AdminModeState = {
  mode: AdminMode;
  toggle: () => void;
  setMode: (mode: AdminMode) => void;
};

/**
 * Mode dashboard admin. Default "easy" (ramah, untuk tim non-teknis).
 * "advanced" menampilkan editor JSON mentah + panel git detail.
 * Disimpan di localStorage tiap browser (perangkat admin).
 */
export const useAdminMode = create<AdminModeState>()(
  persist(
    (set) => ({
      mode: "easy",
      toggle: () => set((s) => ({ mode: s.mode === "easy" ? "advanced" : "easy" })),
      setMode: (mode) => set({ mode }),
    }),
    { name: "buana-admin-mode" },
  ),
);

export const isEasyMode = (mode: AdminMode): boolean => mode === "easy";
