import { create } from "zustand";
import { createClient } from "@supabase/supabase-js";

// --- CONFIGURATION ---
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const EDGE_FUNCTION_BASE_URL = `${SUPABASE_URL}/functions/v1/ai-assistant`;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const useMailStore = create((set, get) => ({
  mails: [],
  selectedMail: null,
  isAnalyzing: false,
  isComposeOpen: false,
  isComposeMinimized: false,
  filter: "Inbox",

  // --- UI ACTIONS ---
  setFilter: (filter) => set({ filter, selectedMail: null }),
  setSelectedMail: (mail) => set({ selectedMail: mail }),
  openCompose: () => set({ isComposeOpen: true, isComposeMinimized: false }),
  closeCompose: () => set({ isComposeOpen: false }),
  toggleMinimize: () => set((s) => ({ isComposeMinimized: !s.isComposeMinimized })),

  // --- FETCH MAILS ---
  fetchMails: async () => {
    const { data, error } = await supabase
      .from("emails")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) set({ mails: data });
  },

  // --- SEND EMAIL (Hits /send-email endpoint) ---
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

      console.log("✅ Email sent successfully");
      return true;
    } catch (error) {
      console.error("❌ Send Error:", error.message);
      throw error;
    }
  },

  // --- AI SUMMARIZE (Hits /summarize endpoint) ---
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

      if (!response.ok) throw new Error("Summarization failed");

      const { data } = await response.json();

      // Update local state so UI reflects change immediately
      set((state) => ({
        selectedMail: { ...state.selectedMail, summary: data },
        mails: state.mails.map((m) =>
          m.id === emailId ? { ...m, summary: data } : m
        ),
      }));
    } catch (error) {
      console.error("❌ AI Summary Error:", error);
    } finally {
      set({ isAnalyzing: false });
    }
  },

  // --- AI DRAFT (Hits /generate-reply endpoint) ---
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

      if (!response.ok) throw new Error("Draft generation failed");

      const { data } = await response.json();

      set((state) => ({
        selectedMail: { ...state.selectedMail, ai_draft: data },
        mails: state.mails.map((m) =>
          m.id === emailId ? { ...m, ai_draft: data } : m
        ),
      }));
    } catch (error) {
      console.error("❌ AI Draft Error:", error);
    } finally {
      set({ isAnalyzing: false });
    }
  },

  // --- REAL-TIME SUBSCRIPTION ---
  subscribeToMails: () => {
    const channel = supabase
      .channel("public:emails")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "emails" },
        () => get().fetchMails()
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  },
}));