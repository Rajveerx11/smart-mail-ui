import { create } from "zustand";
import {
  fetchEmails,
  markAsRead,
  sendReply,
  analyzeOnDemand,
  subscribeToEmails
} from "../services/emailService";

export const useMailStore = create((set, get) => ({
  /* ===== MAIL DATA ===== */
  mails: [],
  isLoading: false,
  error: null,
  subscription: null,

  /* ===== FETCH MAILS FROM SUPABASE ===== */
  fetchMails: async () => {
    set({ isLoading: true, error: null });
    try {
      const mails = await fetchEmails("Inbox");
      // Also fetch spam for the Spam folder
      const spamMails = await fetchEmails("Spam");
      set({
        mails: [...mails, ...spamMails],
        isLoading: false
      });
    } catch (error) {
      console.error("Failed to fetch emails:", error);
      set({ error: error.message, isLoading: false });
    }
  },

  /* ===== REAL-TIME SUBSCRIPTION ===== */
  subscribeToEmails: () => {
    const subscription = subscribeToEmails(
      // onInsert - new email arrived
      (newEmail) => {
        set((s) => ({
          mails: [newEmail, ...s.mails],
        }));
      },
      // onUpdate - email was updated (read status, AI analysis, etc)
      (updatedEmail) => {
        set((s) => ({
          mails: s.mails.map((m) =>
            m.id === updatedEmail.id ? updatedEmail : m
          ),
        }));
      }
    );
    set({ subscription });
  },

  unsubscribeFromEmails: () => {
    const { subscription } = get();
    if (subscription) {
      subscription.unsubscribe();
      set({ subscription: null });
    }
  },

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
  setSelectedMail: async (mail) => {
    set({ selectedMail: mail });
    // Mark as read when selected
    if (mail && !mail.readStatus) {
      try {
        await markAsRead(mail.id);
        // Update local state
        set((s) => ({
          mails: s.mails.map((m) =>
            m.id === mail.id ? { ...m, readStatus: true } : m
          ),
          selectedMail: { ...mail, readStatus: true },
        }));
      } catch (error) {
        console.error("Failed to mark as read:", error);
      }
    }
  },

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
  isSending: false,

  openCompose: () =>
    set({ isComposeOpen: true, isComposeMinimized: false }),

  closeCompose: () =>
    set({ isComposeOpen: false, isComposeMinimized: false }),

  toggleMinimize: () =>
    set((s) => ({ isComposeMinimized: !s.isComposeMinimized })),

  sendMail: async (mail) => {
    set({ isSending: true });
    try {
      await sendReply({
        emailId: mail.replyToId || 'new',
        replyText: mail.body,
        toAddress: mail.to,
        subject: mail.subject,
      });

      // Add to local sent folder
      set((s) => ({
        mails: [
          {
            id: Date.now().toString(),
            folder: "Sent",
            category: "",
            from: "me@gmail.com",
            ...mail,
          },
          ...s.mails,
        ],
        isSending: false,
        isComposeOpen: false,
      }));
    } catch (error) {
      console.error("Failed to send email:", error);
      set({ isSending: false });
      throw error;
    }
  },

  /* ===== AI ANALYSIS ===== */
  isAnalyzing: false,

  triggerAnalysis: async (emailId) => {
    set({ isAnalyzing: true });
    try {
      await analyzeOnDemand(emailId);
      // The real-time subscription will update the email when analysis completes
      set({ isAnalyzing: false });
    } catch (error) {
      console.error("Failed to trigger analysis:", error);
      set({ isAnalyzing: false });
      throw error;
    }
  },

  /* ===== FILTER MAILS ===== */
  getFilteredMails: () => {
    const {
      mails,
      activeFolder,
      activeCategory,
      searchText,
    } = get();

    return mails.filter((m) => {
      // Folder filter
      if (activeFolder === "Spam") {
        if (!m.isSpam) return false;
      } else {
        if (m.folder !== activeFolder) return false;
        if (m.isSpam) return false;
      }

      // Category filter for Inbox
      if (
        activeFolder === "Inbox" &&
        activeCategory !== "Primary" &&
        m.category !== activeCategory
      ) {
        return false;
      }

      // Search filter
      if (searchText) {
        const text = `${m.from} ${m.subject} ${m.body}`.toLowerCase();
        if (!text.includes(searchText.toLowerCase()))
          return false;
      }

      return true;
    });
  },
}));
