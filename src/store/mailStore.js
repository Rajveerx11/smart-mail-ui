import { create } from "zustand";
import { supabase } from "../lib/supabase";

export const useMailStore = create((set, get) => ({
  /* ===== MAIL DATA ===== */
  mails: [],
  isLoading: false,
  error: null,
  subscription: null,
  searchHistory: [],

  /* ===== USER AUTH ===== */
  user: null,
  setUser: (user) => set({ user }),

  // Fetch emails from Supabase
  fetchMails: async () => {
    set({ isLoading: true, error: null });
    const { data, error } = await supabase
      .from('emails')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error) {
      set({ mails: data || [], isLoading: false });
    } else {
      console.error("❌ Fetch failed:", error.message);
      set({ error: error.message, isLoading: false });
    }
  },

  // Real-time Listener: This will automatically update the UI 
  // when the AI Agent saves the Summary or Draft to Supabase.
  subscribeToMails: () => {
    const channel = supabase
      .channel('realtime_emails')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'emails' },
        (payload) => {
          if (!payload) return;

          if (payload.eventType === 'INSERT') {
            set((s) => ({ mails: [payload.new, ...s.mails] }));
          } else if (payload.eventType === 'UPDATE') {
            set((s) => ({
              mails: s.mails.map(m => m.id === payload.new.id ? payload.new : m),
              // Update selectedMail if it's the one currently open
              selectedMail: get().selectedMail?.id === payload.new.id ? payload.new : get().selectedMail
            }));
          }
        }
      )
      .subscribe((status) => {
        console.log("Subscription status:", status);
      });
    return channel;
  },

  /* ===== UI STATE ===== */
  isProfileOpen: false,
  toggleProfile: () => set((s) => ({ isProfileOpen: !s.isProfileOpen })),
  closeProfile: () => set({ isProfileOpen: false }),

  isSidebarOpen: true,
  toggleSidebar: () => set((s) => ({ isSidebarOpen: !s.isSidebarOpen })),

  activeFolder: "Inbox",
  setActiveFolder: (f) => set({ activeFolder: f, selectedMail: null }),

  activeCategory: "Primary",
  setActiveCategory: (c) => set({ activeCategory: c }),

  selectedMail: null,
  setSelectedMail: async (mail) => {
    set({ selectedMail: mail });
    if (mail && !mail.read_status && !mail.readStatus) {
      try {
        const { error } = await supabase
          .from('emails')
          .update({ read_status: true })
          .eq('id', mail.id);

        if (error) throw error;

        set((s) => ({
          mails: s.mails.map((m) =>
            m.id === mail.id ? { ...m, read_status: true, readStatus: true } : m
          ),
          selectedMail: { ...mail, read_status: true, readStatus: true },
        }));
      } catch (error) {
        console.error("Failed to mark as read:", error);
      }
    }
  },

  searchText: "",
  setSearchText: (t) => set({ searchText: t }),
  clearSearch: () => set({ searchText: "" }),

  addSearchHistory: (text) => {
    if (!text) return;
    set((s) => ({
      searchHistory: [
        text,
        ...s.searchHistory.filter((i) => i !== text),
      ].slice(0, 5),
    }));
  },

  /* ===== COMPOSE & SEND ===== */
  isComposeOpen: false,
  isComposeMinimized: false,
  isSending: false,

  openCompose: () => set({ isComposeOpen: true, isComposeMinimized: false }),
  closeCompose: () => set({ isComposeOpen: false, isComposeMinimized: false }),
  toggleMinimize: () => set((s) => ({ isComposeMinimized: !s.isComposeMinimized })),

  sendMail: async (mailData) => {
    set({ isSending: true });
    const { user } = get();
    const { error } = await supabase.from('emails').insert([{
      sender: user?.email || "anonymous@bodhakai.online",
      recipient: mailData.to,
      subject: mailData.subject,
      body: mailData.body,
      processed: false,
      folder: "Sent",
      message_id: crypto.randomUUID()
    }]);

    if (error) {
      console.error("❌ Send failed:", error.message);
    } else {
      set({ isComposeOpen: false });
    }
    set({ isSending: false });
  },

  /* ===== ON-DEMAND AI COPILOT ===== */
  isAnalyzing: false,

  // Function 1: Manual Summarization Trigger
  generateAISummary: async (emailId) => {
    set({ isAnalyzing: true });
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/summarize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email_id: emailId }),
      });
      if (!response.ok) throw new Error('Summarization failed');

      // Success: The real-time listener will update the local state 
      // when the backend writes the result to Supabase.
    } catch (error) {
      console.error("❌ Summary Generation Failed:", error);
    } finally {
      set({ isAnalyzing: false });
    }
  },

  // Function 2: Manual Draft Generation Trigger
  generateAIDraft: async (emailId) => {
    set({ isAnalyzing: true });
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/generate-reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email_id: emailId }),
      });
      if (!response.ok) throw new Error('Draft generation failed');

      // Success: UI updates via subscribeToMails.
    } catch (error) {
      console.error("❌ Draft Generation Failed:", error);
    } finally {
      set({ isAnalyzing: false });
    }
  },

  /* ===== FILTER MAILS ===== */
  getFilteredMails: () => {
    const { mails, activeFolder, searchText } = get();

    return mails.filter((m) => {
      if (m.folder !== activeFolder) return false;

      if (searchText) {
        const textStr = `${m.sender || ''} ${m.subject || ''} ${m.body || ''}`.toLowerCase();
        if (!textStr.includes(searchText.toLowerCase())) return false;
      }
      return true;
    });
  },
}));