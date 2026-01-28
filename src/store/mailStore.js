import { create } from "zustand";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const EDGE_FUNCTION_BASE_URL = `${SUPABASE_URL}/functions/v1/ai-assistant`;

// Singleton instance to prevent "Multiple GoTrueClient" errors
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const useMailStore = create((set, get) => ({
  // --- CORE STATE ---
  user: null,
  mails: [],
  selectedMail: null,
  filter: "Inbox",
  isLoading: false,
  error: null,

  // --- UI STATE ---
  isComposeOpen: false,
  isComposeMinimized: false,
  isAnalyzing: false,

  // --- AUTH ACTIONS ---
  setUser: (user) => set({ user }),
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

  // --- TAB & FOLDER ACTIONS ---
  setFilter: (filter) => set({ filter, selectedMail: null }),
  setSelectedMail: (mail) => set({ selectedMail: mail }),

  // --- COMPOSE ACTIONS ---
  openCompose: () => set({ isComposeOpen: true, isComposeMinimized: false }),
  closeCompose: () => set({ isComposeOpen: false }),
  toggleMinimize: () => set((s) => ({ isComposeMinimized: !s.isComposeMinimized })),

  // --- DATA ACTIONS ---
  fetchMails: async () => {
    if (get().isLoading) return;
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
    } finally {
      set({ isLoading: false });
    }
  },

  sendMail: async (emailData) => {
    const response = await fetch(`${EDGE_FUNCTION_BASE_URL}/send-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify(emailData),
    });
    if (!response.ok) throw new Error("Failed to send email");
    return true;
  },

  // --- AI LOGIC ---
  generateAISummary: async (emailId) => {
    set({ isAnalyzing: true });
    try {
      const res = await fetch(`${EDGE_FUNCTION_BASE_URL}/summarize`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${SUPABASE_ANON_KEY}` },
        body: JSON.stringify({ email_id: emailId }),
      });
      const result = await res.json();
      set((s) => ({
        selectedMail: { ...s.selectedMail, summary: result.data },
        mails: s.mails.map((m) => m.id === emailId ? { ...m, summary: result.data } : m),
      }));
    } finally { set({ isAnalyzing: false }); }
  },

  generateAIDraft: async (emailId) => {
    set({ isAnalyzing: true });
    try {
      const res = await fetch(`${EDGE_FUNCTION_BASE_URL}/generate-reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${SUPABASE_ANON_KEY}` },
        body: JSON.stringify({ email_id: emailId }),
      });
      const result = await res.json();
      set((s) => ({
        selectedMail: { ...s.selectedMail, ai_draft: result.data },
        mails: s.mails.map((m) => m.id === emailId ? { ...m, ai_draft: result.data } : m),
      }));
    } finally { set({ isAnalyzing: false }); }
  },

  subscribeToMails: () => {
    const channel = supabase.channel("mail-changes").on("postgres_changes", { event: "*", schema: "public", table: "emails" }, () => get().fetchMails()).subscribe();
    return () => { supabase.removeChannel(channel); };
  },
}));