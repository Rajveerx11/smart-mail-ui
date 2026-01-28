import { create } from "zustand";
import { createClient } from "@supabase/supabase-js";

// --- SINGLETON INITIALIZATION ---
// This is the ONLY place supabase should be initialized in your entire app.
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const EDGE_FUNCTION_BASE_URL = `${SUPABASE_URL}/functions/v1/ai-assistant`;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const useMailStore = create((set, get) => ({
  // --- STATE ---
  user: null,
  mails: [],
  selectedMail: null,
  isAnalyzing: false,
  isComposeOpen: false,
  isComposeMinimized: false,
  filter: "Inbox",
  isLoading: false,
  error: null,

  // --- AUTH ACTIONS ---
  setUser: (user) => set({ user }),

  initializeAuth: async () => {
    // 1. Check for existing session on load
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      set({ user: session.user });
      get().fetchMails();
    }

    // 2. Setup the single auth listener
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

  // --- UI ACTIONS ---
  setFilter: (filter) => set({ filter, selectedMail: null }),
  setSelectedMail: (mail) => set({ selectedMail: mail }),
  openCompose: () => set({ isComposeOpen: true, isComposeMinimized: false }),
  closeCompose: () => set({ isComposeOpen: false }),
  toggleMinimize: () => set((s) => ({ isComposeMinimized: !s.isComposeMinimized })),

  // --- DATA ACTIONS ---
  fetchMails: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from("emails")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      set({ mails: data || [] });
    } catch (err) {
      set({ error: err.message });
      console.error("❌ Fetch Mails Error:", err.message);
    } finally {
      set({ isLoading: false });
    }
  },

  sendMail: async (emailData) => {
    try {
      const response = await fetch(`${EDGE_FUNCTION_BASE_URL}/send-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify(emailData),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to send email");
      }
      return true;
    } catch (error) {
      console.error("❌ Send Error:", error.message);
      throw error;
    }
  },

  // --- AI ACTIONS ---
  generateAISummary: async (emailId) => {
    set({ isAnalyzing: true });
    try {
      const response = await fetch(`${EDGE_FUNCTION_BASE_URL}/summarize`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ email_id: emailId }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Summarization failed");

      set((state) => ({
        selectedMail: { ...state.selectedMail, summary: result.data },
        mails: state.mails.map((m) =>
          m.id === emailId ? { ...m, summary: result.data } : m
        ),
      }));
    } catch (error) {
      console.error("❌ AI Summary Error:", error.message);
    } finally {
      set({ isAnalyzing: false });
    }
  },

  generateAIDraft: async (emailId) => {
    set({ isAnalyzing: true });
    try {
      const response = await fetch(`${EDGE_FUNCTION_BASE_URL}/generate-reply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ email_id: emailId }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Draft generation failed");

      set((state) => ({
        selectedMail: { ...state.selectedMail, ai_draft: result.data },
        mails: state.mails.map((m) =>
          m.id === emailId ? { ...m, ai_draft: result.data } : m
        ),
      }));
    } catch (error) {
      console.error("❌ AI Draft Error:", error.message);
    } finally {
      set({ isAnalyzing: false });
    }
  },

  // --- REAL-TIME SUBSCRIPTION ---
  subscribeToMails: () => {
    const channel = supabase
      .channel("mail-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "emails" },
        () => get().fetchMails()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },
}));