import { create } from "zustand";

interface AuthStore {
  userId: string | null;
  username: string | null;
  role: string | null;
  setUser: (user: { id: string; username: string; role: string }) => void;
  clearUser: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  userId: null,
  username: null,
  role: null,
  setUser: ({ id, username, role }) => set({ userId: id, username, role }),
  clearUser: () => set({ userId: null, username: null, role: null }),
}));
