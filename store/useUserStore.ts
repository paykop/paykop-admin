// src/store/useUserStore.ts
import { create } from "zustand";
import { UserProfileInput } from "../schemas/userSchema";

interface UserState {
  profile: UserProfileInput | null;
  setProfile: (profile: UserProfileInput) => void;
  clearProfile: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  profile: null,
  setProfile: (profile) => set({ profile }),
  clearProfile: () => set({ profile: null }),
}));
