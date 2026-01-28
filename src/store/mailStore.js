import { create } from "zustand";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const EDGE_URL = `${SUPABASE_URL}/functions/v1/ai-assistant`;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const useMailStore = create((set, get) => ({
  // --- STATE ---
  user: null,
  mails: [],
  selectedMail: null,
  activeFolder: "Inbox",
  activeCategory: "Primary",
  searchText: "",
  isLoading: false,
  isAnalyzing: false,

  // --- ACTIONS ---
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
      } else set({ user: null, mails: [] });
    });
    return subscription;
  },

  fetchMails: async () => {
    if (get().isLoading) return;
    set({ isLoading: true });
    const { data, error } = await supabase
      .from("emails")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) set({ mails: data || [] });
    set({ isLoading: false });
  },

  sendMail: async (emailData) => {
    await fetch(`${EDGE_URL}/send-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${SUPABASE_ANON_KEY}` },
      body: JSON.stringify(emailData),
    });
    return true;
  },

  // --- AI ACTIONS ---
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

  // --- REAL-TIME SYNC ---
  subscribeToMails: () => {
    const channel = supabase
      .channel("mail-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "emails" }, (payload) => {
        // Efficient Update: If a mail body is updated, update only that mail in the list
        if (payload.eventType === "UPDATE") {
          set((state) => ({
            mails: state.mails.map(m => m.id === payload.new.id ? payload.new : m),
            // Update selected view if it's the one that just got its body
            selectedMail: state.selectedMail?.id === payload.new.id ? payload.new : state.selectedMail
          }));
        } else {
          // For New Mails (INSERT), refresh the whole list to keep sorting
          get().fetchMails();
        }
      })
      .subscribe();
    return () => supabase.removeChannel(channel);
  }
}));