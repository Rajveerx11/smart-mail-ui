import { create } from "zustand";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const EDGE_URL = `${SUPABASE_URL}/functions/v1/ai-assistant`;
const PHISHING_API = "http://65.2.172.22:5000/api/phishing";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const useMailStore = create((set, get) => ({
  user: null,
  mails: [],
  selectedMail: null,
  activeFolder: "Inbox",
  activeCategory: "Primary",
  searchText: "",
  searchHistory: [],
  isLoading: false,
  isRefreshing: false,
  isAnalyzing: false,
  isComposeOpen: false,
  isComposeMinimized: false,
  isSidebarOpen: true,
  isProfileOpen: false,
  isAddAccountOpen: false,
  isSignOutOpen: false,

  // ── Existing actions — unchanged ──────────────────────────
  openCompose: () => set({ isComposeOpen: true, isComposeMinimized: false }),
  closeCompose: () => set({ isComposeOpen: false, isComposeMinimized: false }),
  toggleMinimize: () => set((state) => ({ isComposeMinimized: !state.isComposeMinimized })),
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  toggleProfile: () => set((state) => ({ isProfileOpen: !state.isProfileOpen })),
  closeProfile: () => set({ isProfileOpen: false }),
  openAddAccount: () => set({ isAddAccountOpen: true, isProfileOpen: false }),
  closeAddAccount: () => set({ isAddAccountOpen: false }),
  openSignOut: () => set({ isSignOutOpen: true, isProfileOpen: false }),
  closeSignOut: () => set({ isSignOutOpen: false }),
  addSearchHistory: (term) => set((state) => {
    if (!term.trim()) return state;
    const filtered = state.searchHistory.filter(h => h !== term);
    return { searchHistory: [term, ...filtered].slice(0, 5) };
  }),
  clearSearch: () => set({ searchText: "" }),
  setUser: (user) => set({ user }),
  setFolder: (folder) => set({ activeFolder: folder, activeCategory: "Primary", selectedMail: null }),
  setActiveCategory: (category) => set({ activeCategory: category, selectedMail: null }),
  setSearchText: (text) => set({ searchText: text }),
  setSelectedMail: (mail) => set({ selectedMail: mail }),

  updateUser: async (updates) => {
    try {
      const { data, error } = await supabase.auth.updateUser({ data: updates });
      if (error) throw error;
      set({ user: data.user });
      return { success: true };
    } catch (err) {
      console.error("Update user error:", err.message);
      return { success: false, error: err.message };
    }
  },

  logout: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      set({ user: null, mails: [], selectedMail: null });
      return { success: true };
    } catch (err) {
      console.error("Logout error:", err.message);
      return { success: false, error: err.message };
    }
  },

  uploadProfilePhoto: async (file) => {
    try {
      const user = get().user;
      if (!user) throw new Error("No user logged in");
      if (!file.type.startsWith('image/')) throw new Error("Please select a valid image file");
      if (file.size > 5 * 1024 * 1024) throw new Error("Image size must be less than 5MB");
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}_${Date.now()}.${fileExt}`;
      const filePath = `profile-photos/${fileName}`;
      const { error: uploadError } = await supabase.storage
        .from('profile-photos')
        .upload(filePath, file, { cacheControl: '3600', upsert: false });
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('profile-photos').getPublicUrl(filePath);
      await get().updateUser({ photo: publicUrl });
      return { success: true, url: publicUrl };
    } catch (err) {
      console.error("Upload photo error:", err.message);
      return { success: false, error: err.message };
    }
  },

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

  fetchMails: async () => {
    if (get().isLoading) return;
    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from("emails")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
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
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${SUPABASE_ANON_KEY}` },
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

  // ── NEW: Auto-scan email on arrival ──────────────────────
  autoScanMail: async (mail) => {
    try {
      const res = await fetch(PHISHING_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sender: mail.sender || "",
          subject: mail.subject || "",
          body: mail.body || "",
        }),
      });
      const data = await res.json();
      if (!data.success) return;

      const score = data.score;
      const reasons = data.reasons || [];
      const shouldQuarantine = score >= 60;

      // Update in Supabase
      await supabase
        .from("emails")
        .update({
          phishing_score: score,
          quarantine_status: shouldQuarantine,
          quarantine_reason: reasons.join(" | "),
        })
        .eq("id", mail.id);

      // Update local state
      set((s) => ({
        mails: s.mails.map(m =>
          m.id === mail.id
            ? { ...m, phishing_score: score, quarantine_status: shouldQuarantine, quarantine_reason: reasons.join(" | ") }
            : m
        ),
      }));

      console.log(`[PhishGuard] ${mail.sender} → Score: ${score} → ${shouldQuarantine ? "QUARANTINED" : "SAFE"}`);
    } catch (err) {
      console.error("[PhishGuard] Auto-scan failed:", err.message);
    }
  },

  // ── NEW: Release email from quarantine ───────────────────
  releaseMail: async (id) => {
    await supabase
      .from("emails")
      .update({ quarantine_status: false, quarantine_reason: null })
      .eq("id", id);

    set((s) => ({
      mails: s.mails.map(m =>
        m.id === id ? { ...m, quarantine_status: false, quarantine_reason: null } : m
      ),
      selectedMail: s.selectedMail?.id === id
        ? { ...s.selectedMail, quarantine_status: false, quarantine_reason: null }
        : s.selectedMail,
    }));
  },

  // ── NEW: Permanently delete email ────────────────────────
  deleteMail: async (id) => {
    await supabase.from("emails").delete().eq("id", id);
    set((s) => ({
      mails: s.mails.filter(m => m.id !== id),
      selectedMail: s.selectedMail?.id === id ? null : s.selectedMail,
    }));
  },

  subscribeToMails: () => {
    const channel = supabase
      .channel("mail-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "emails" }, (payload) => {
        const { eventType, new: newRecord, old: oldRecord } = payload;
        set((state) => {
          let updatedMails = [...state.mails];
          if (eventType === "INSERT") {
            if (!updatedMails.some(m => m.id === newRecord.id)) {
              updatedMails = [newRecord, ...updatedMails];
            }
          } else if (eventType === "UPDATE") {
            updatedMails = updatedMails.map(m => m.id === newRecord.id ? newRecord : m);
            if (state.selectedMail?.id === newRecord.id) {
              set({ selectedMail: newRecord });
            }
          } else if (eventType === "DELETE") {
            updatedMails = updatedMails.filter(m => m.id !== oldRecord.id);
          }
          return { mails: updatedMails };
        });
      })
      .subscribe();
    return () => supabase.removeChannel(channel);
  }
}));
