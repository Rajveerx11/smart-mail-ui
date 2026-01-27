import { create } from "zustand";

export const useAuthStore = create((set) => ({
  isLoggedIn: false,
  splashDone: false,

  checkAuth: () => {
    const user = localStorage.getItem("user");
    set({ isLoggedIn: !!user });
  },

  finishSplash: () => set({ splashDone: true }),

  login: (user) => {
    localStorage.setItem("user", JSON.stringify(user));
    set({ isLoggedIn: true });
  },

  logout: () => {
    localStorage.removeItem("user");
    set({ isLoggedIn: false });
  },
}));
