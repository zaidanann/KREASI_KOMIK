import { create } from "zustand";

interface UIStore {
  isMobileDrawerOpen: boolean;
  toggleMobileDrawer: () => void;
  closeMobileDrawer: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  isMobileDrawerOpen: false,
  toggleMobileDrawer: () => set((s) => ({ isMobileDrawerOpen: !s.isMobileDrawerOpen })),
  closeMobileDrawer: () => set({ isMobileDrawerOpen: false }),
}));
