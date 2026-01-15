import { create } from "zustand";
import { mails as initialMails } from "../data/dummyMails";

export const useMailStore = create((set, get) => ({
  /* ===== MAIL DATA ===== */
  mails: initialMails,

  /* ===== USER AUTH ===== */
  user: {
    name: "Marco",
    email: "marco@gmail.com",
    photo: null,
  },

  isProfileOpen: false,
  toggleProfile: () =>
    set((s) => ({ isProfileOpen: !s.isProfileOpen })),
  closeProfile: () => set({ isProfileOpen: false }),

  /* 🔹 ADD ACCOUNT */
  isAddAccountOpen: false,
  openAddAccount: () => set({ isAddAccountOpen: true }),
  closeAddAccount: () => set({ isAddAccountOpen: false }),

  /* 🔹 SIGN OUT */
  isSignOutOpen: false,
  openSignOut: () => set({ isSignOutOpen: true }),
  closeSignOut: () => set({ isSignOutOpen: false }),

  /* 🔹 MANAGE ACCOUNT (FIX) */
  isManageAccountOpen: false,
  openManageAccount: () => set({ isManageAccountOpen: true }),
  closeManageAccount: () => set({ isManageAccountOpen: false }),

  /* ===== SIDEBAR ===== */
  isSidebarOpen: true,
  toggleSidebar: () =>
    set((s) => ({ isSidebarOpen: !s.isSidebarOpen })),

  activeFolder: "Inbox",
  setActiveFolder: (f) => set({ activeFolder: f }),

  activeCategory: "Primary",
  setActiveCategory: (c) => set({ activeCategory: c }),

  /* ===== SELECTED MAIL ===== */
  selectedMail: null,
  setSelectedMail: (mail) => set({ selectedMail: mail }),

  /* ===== SEARCH ===== */
  searchText: "",
  searchHistory: [],

  setSearchText: (t) => set({ searchText: t }),
  clearSearch: () => set({ searchText: "" }),

  addSearchHistory: (text) =>
    set((s) => ({
      searchHistory: [
        text,
        ...s.searchHistory.filter((i) => i !== text),
      ].slice(0, 5),
    })),

  /* ===== ADVANCED SEARCH ===== */
  isSearchPanelOpen: false,
  advancedSearch: null,

  openSearchPanel: () => set({ isSearchPanelOpen: true }),
  closeSearchPanel: () => set({ isSearchPanelOpen: false }),

  setAdvancedSearch: (data) =>
    set({
      advancedSearch: data,
      isSearchPanelOpen: false,
    }),

  resetAdvancedSearch: () => set({ advancedSearch: null }),

  /* ===== COMPOSE ===== */
  isComposeOpen: false,
  isComposeMinimized: false,

  openCompose: () =>
    set({ isComposeOpen: true, isComposeMinimized: false }),

  closeCompose: () =>
    set({ isComposeOpen: false, isComposeMinimized: false }),

  toggleMinimize: () =>
    set((s) => ({ isComposeMinimized: !s.isComposeMinimized })),

  sendMail: (mail) =>
    set((s) => ({
      mails: [
        {
          id: Date.now(),
          folder: "Sent",
          category: "",
          ...mail,
        },
        ...s.mails,
      ],
    })),

  /* ===== FILTER MAILS (UNCHANGED) ===== */
  getFilteredMails: () => {
    const {
      mails,
      activeFolder,
      activeCategory,
      searchText,
    } = get();

    return mails.filter((m) => {
      if (activeFolder === "Spam") {
        if (!m.isSpam) return false;
      } else {
        if (m.folder !== activeFolder) return false;
        if (m.isSpam) return false;
      }

      if (
        activeFolder === "Inbox" &&
        activeCategory !== "Primary" &&
        m.category !== activeCategory
      ) {
        return false;
      }

      if (searchText) {
        const text = `${m.from} ${m.subject} ${m.body}`.toLowerCase();
        if (!text.includes(searchText.toLowerCase()))
          return false;
      }

      return true;
    });
  },
}));
