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
  filter: "Inbox",
  isLoading: false,
  isAnalyzing: false,

  setUser: (user) => set({ user }),
  setFilter: (filter) => set({ filter, selectedMail: null }),
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
      } else set({ user: null, mails: [] });
    });
    return subscription;
  },

  fetchMails: async () => {
    if (get().isLoading) return;
    set({ isLoading: true });
    const { data } = await supabase.from("emails").select("*").order("created_at", { ascending: false });
    set({ mails: data || [], isLoading: false });
  },

  sendMail: async (emailData) => {
    await fetch(`${EDGE_URL}/send-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${SUPABASE_ANON_KEY}` },
      body: JSON.stringify(emailData),
    });
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

  subscribeToMails: () => {
    const channel = supabase.channel("mail-changes").on("postgres_changes", { event: "*", schema: "public", table: "emails" }, () => get().fetchMails()).subscribe();
    return () => supabase.removeChannel(channel);
  }
}));