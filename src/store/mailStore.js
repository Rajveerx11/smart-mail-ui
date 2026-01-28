import { create } from "zustand";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const EDGE_FUNCTION_BASE_URL = `${SUPABASE_URL}/functions/v1/ai-assistant`;

// SINGLE INSTANCE
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const useMailStore = create((set, get) => ({
  user: null,
  mails: [],
  selectedMail: null,
  isAnalyzing: false,
  isComposeOpen: false,
  isComposeMinimized: false,
  filter: "Inbox",
  isLoading: false,
  error: null,

  setUser: (user) => set({ user }),

  // STABLE INITIALIZATION
  initializeAuth: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      set({ user: session.user });
      get().fetchMails();
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        set({ user: session.user });
        // Only fetch if it's a fresh sign-in or token refresh
        if (event === 'SIGNED_IN') get().fetchMails();
      } else {
        set({ user: null, mails: [], selectedMail: null });
      }
    });

    return subscription;
  },

  fetchMails: async () => {
    // PREVENT DUPLICATE CALLS
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
      console.error("❌ Fetch Mails Error:", err.message);
    } finally {
      set({ isLoading: false });
    }
  },

  // ... (sendMail, generateAISummary, generateAIDraft stay the same as before) ...

  subscribeToMails: () => {
    // Cleanup any existing channel before starting a new one
    const existingChannel = supabase.getChannels().find(c => c.name === 'mail-changes');
    if (existingChannel) return () => { };

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