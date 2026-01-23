import { create } from "zustand";
import { supabase } from "../lib/supabase";

export const useMailStore = create((set, get) => ({
  /* ===== MAIL DATA ===== */
  mails: [],
  isLoading: false,
  error: null,
  subscription: null,

  searchHistory: [], // Initialized as empty

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

  // Real-time Listener for Agent responses
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
              mails: s.mails.map(m => m.id === payload.new.id ? payload.new : m)
            }));
          }
        }
      )
      .subscribe((status) => {
        // Subscription status handler
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
    // Mark as read when selected
    // Note: mail.read_status might be the key now if we are using raw Supabase data
    if (mail && !mail.read_status && !mail.readStatus) {
      // Handle both cases just to be safe, though likely read_status
      try {
        const { error } = await supabase
          .from('emails')
          .update({ read_status: true })
          .eq('id', mail.id);

        if (error) throw error;

        // Update local state
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
    // Support both direct object pass or arg check (HEAD vs Incoming difference)
    // Incoming passed `mailData`, HEAD passed `mail`

    // We'll use the Incoming implementation style (Direct Insert) but wrapped with loading state
    const { error } = await supabase.from('emails').insert([{
      sender: user?.email || "anonymous@bodhakai.online",
      recipient: mailData.to,
      subject: mailData.subject,
      body: mailData.body,
      processed: false,
      folder: "Sent",
      message_id: crypto.randomUUID() // Ensure native crypto or uuid lib
    }]);

    if (error) {
      console.error("❌ Send failed:", error.message);
    } else {
      set({ isComposeOpen: false });
    }
    set({ isSending: false });
  },

  /* ===== AI ANALYSIS ===== */
  isAnalyzing: false,

  triggerAnalysis: async (emailId) => {
    set({ isAnalyzing: true });
    try {
      // We can keep using the service for this specific call if it exists, 
      // or just rely on the backend being generic. 
      // For now, let's assuming fetch still works if we import it, 
      // but to be safe/consistent with this file, let's just make the fetch call here 
      // or assume the user wants us to use the service if imported.
      // Since I removed the service import to match 'Incoming', I should implement it here or re-import.
      // Re-implementing simplified version:
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/analyze-on-demand`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email_id: emailId }),
      });
      if (!response.ok) throw new Error('Analysis failed');

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
    const { mails, activeFolder, searchText } = get();

    return mails.filter((m) => {
      // Basic folder routing from Incoming
      if (m.folder !== activeFolder) return false;

      // Real-time search filter
      if (searchText) {
        const textStr = `${m.sender || ''} ${m.subject || ''} ${m.body || ''}`.toLowerCase();
        if (!textStr.includes(searchText.toLowerCase())) return false;
      }
      return true;
    });
  },
}));