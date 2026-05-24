"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ADMIN_CREDENTIALS } from "@/lib/constants";

interface AuthState {
  // Admin
  isAuthed: boolean;
  // Ofitsiant (sessiya — qaysi ofitsiant zakaz qabul qilyapti)
  waiterId: string | null;
  waiterName: string | null;

  loginAdmin: (username: string, password: string) => boolean;
  logoutAdmin: () => void;

  setWaiter: (id: string, name: string) => void;
  clearWaiter: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthed: false,
      waiterId: null,
      waiterName: null,

      loginAdmin: (username, password) => {
        if (
          username === ADMIN_CREDENTIALS.username &&
          password === ADMIN_CREDENTIALS.password
        ) {
          set({ isAuthed: true });
          return true;
        }
        return false;
      },
      logoutAdmin: () => set({ isAuthed: false }),

      setWaiter: (id, name) => set({ waiterId: id, waiterName: name }),
      clearWaiter: () => set({ waiterId: null, waiterName: null }),
    }),
    { name: "sohil-choyxona-auth-v2" }
  )
);
