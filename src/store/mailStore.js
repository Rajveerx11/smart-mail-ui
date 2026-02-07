import { create } from "zustand";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const EDGE_URL = `${SUPABASE_URL}/functions/v1/ai-assistant`;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const useMailStore = create((set, get) => ({
  user: null,
  mails: [],
  selectedMail: null,
  activeFolder: "Inbox",
  activeCategory: "Primary",
  searchText: "",
  isLoading: false,
  isRefreshing: false,
  isAnalyzing: false,
  isComposeOpen: false,
  isComposeMinimized: false,
  isSidebarOpen: true,

  // Compose modal actions
  openCompose: () => set({ isComposeOpen: true, isComposeMinimized: false }),
  closeCompose: () => set({ isComposeOpen: false, isComposeMinimized: false }),
  toggleMinimize: () => set((state) => ({ isComposeMinimized: !state.isComposeMinimized })),

  // Sidebar toggle
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),

  setUser: (user) => set({ user }),
  setFolder: (folder) => set({ activeFolder: folder, activeCategory: "Primary", selectedMail: null }),
  setActiveCategory: (category) => set({ activeCategory: category, selectedMail: null }),
  setSearchText: (text) => set({ searchText: text }),
  setSelectedMail: (mail) => set({ selectedMail: mail }),

  initializeAuth: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      set({ user: session.user });
      get().fetchMails();
    }
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        set({ user: session.user });
        get().fetchMails();
      } else {
        set({ user: null, mails: [], selectedMail: null });
      }
    });
    return subscription;
  },

  // --- FETCH & REFRESH WITH DUPLICATE GUARD ---
  fetchMails: async () => {
    if (get().isLoading) return;
    set({ isLoading: true });

    try {
      const { data, error } = await supabase
        .from("emails")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // FIX: Replace the entire array to avoid appending duplicates on refresh
      set({ mails: data || [] });
    } catch (err) {
      console.error("Fetch error:", err.message);
    } finally {
      set({ isLoading: false });
    }
  },

  forceRefresh: async () => {
    set({ isRefreshing: true });
    await get().fetchMails();
    setTimeout(() => set({ isRefreshing: false }), 600);
  },

  sendMail: async (emailData) => {
    const response = await fetch(`${EDGE_URL}/send-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify(emailData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to send email");
    }

    get().fetchMails();
    return true;
  },

  generateAISummary: async (id) => {
    set({ isAnalyzing: true });
    const res = await fetch(`${EDGE_URL}/summarize`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${SUPABASE_ANON_KEY}` },
      body: JSON.stringify({ email_id: id }),
    });
    const result = await res.json();
    set((s) => ({
      selectedMail: { ...s.selectedMail, summary: result.data },
      mails: s.mails.map(m => m.id === id ? { ...m, summary: result.data } : m),
      isAnalyzing: false
    }));
  },

  generateAIDraft: async (id) => {
    set({ isAnalyzing: true });
    const res = await fetch(`${EDGE_URL}/generate-reply`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${SUPABASE_ANON_KEY}` },
      body: JSON.stringify({ email_id: id }),
    });
    const result = await res.json();
    set((s) => ({
      selectedMail: { ...s.selectedMail, ai_draft: result.data },
      mails: s.mails.map(m => m.id === id ? { ...m, ai_draft: result.data } : m),
      isAnalyzing: false
    }));
  },

  // --- SURGICAL REAL-TIME UPDATES ---
  subscribeToMails: () => {
    const channel = supabase
      .channel("mail-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "emails" }, (payload) => {
        const { eventType, new: newRecord, old: oldRecord } = payload;

        set((state) => {
          let updatedMails = [...state.mails];

          if (eventType === "INSERT") {
            // Only add if it doesn't already exist in state
            if (!updatedMails.some(m => m.id === newRecord.id)) {
              updatedMails = [newRecord, ...updatedMails];
            }
          }
          else if (eventType === "UPDATE") {
            updatedMails = updatedMails.map(m => m.id === newRecord.id ? newRecord : m);
            // Update selected view if currently open
            if (state.selectedMail?.id === newRecord.id) {
              set({ selectedMail: newRecord });
            }
          }
          else if (eventType === "DELETE") {
            updatedMails = updatedMails.filter(m => m.id === oldRecord.id);
          }

          return { mails: updatedMails };
        });
      })
      .subscribe();
    return () => supabase.removeChannel(channel);
  }
}));