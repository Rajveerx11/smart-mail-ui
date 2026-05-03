import { create } from "zustand";
import { createClient } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

export { supabase };

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const EDGE_URL = `${SUPABASE_URL}/functions/v1/ai-assistant`;
const PHISHING_API = "https://axon-phishing-backend.onrender.com/api/phishing";

const QUARANTINE_SUPABASE_URL = import.meta.env.VITE_QUARANTINE_SUPABASE_URL;
const QUARANTINE_SUPABASE_KEY = import.meta.env.VITE_QUARANTINE_SUPABASE_ANON_KEY;

if (!QUARANTINE_SUPABASE_URL || !QUARANTINE_SUPABASE_KEY) {
  console.warn(
    "Quarantine Supabase env vars missing (VITE_QUARANTINE_SUPABASE_URL / VITE_QUARANTINE_SUPABASE_ANON_KEY). Quarantine logs disabled."
  );
}

const mySupabase = QUARANTINE_SUPABASE_URL && QUARANTINE_SUPABASE_KEY
  ? createClient(QUARANTINE_SUPABASE_URL, QUARANTINE_SUPABASE_KEY, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    })
  : null;

const autoScanInFlight = new Set();


// 🔥🔥🔥 ADDED FUNCTION (NEW)
const getCategory = (mail) => {
  const text = `${mail.subject || ""} ${mail.body || ""}`.toLowerCase();

  if (
    text.includes("sale") ||
    text.includes("discount") ||
    text.includes("offer") ||
    text.includes("deal") ||
    text.includes("limited time")
  ) {
    return "Promotions";
  }

  if (
    text.includes("facebook") ||
    text.includes("instagram") ||
    text.includes("twitter") ||
    text.includes("linkedin")
  ) {
    return "Social";
  }

  if (
    text.includes("update") ||
    text.includes("alert") ||
    text.includes("notification")
  ) {
    return "Updates";
  }

  return "Primary";
};


// 🔥 UPDATED normalizeMail (ONLY 1 LINE ADDED)
const normalizeMail = (mail) => ({
  ...mail,
  category: mail?.category || getCategory(mail), // ✅ MAIN FIX
  quarantine_status: mail?.quarantine_status === true,
  quarantine_reason: mail?.quarantine_reason ?? null,
  phishing_score: mail?.phishing_score ?? null,
});

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
    const filtered = state.searchHistory.filter((h) => h !== term);
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
      if (!file.type.startsWith("image/")) throw new Error("Please select a valid image file");
      if (file.size > 5 * 1024 * 1024) throw new Error("Image size must be less than 5MB");

      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}_${Date.now()}.${fileExt}`;
      const filePath = `profile-photos/${fileName}`;
      const { error: uploadError } = await supabase.storage
        .from("profile-photos")
        .upload(filePath, file, { cacheControl: "3600", upsert: false });
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from("profile-photos").getPublicUrl(filePath);
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

      set({ mails: (data || []).map(normalizeMail) });
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
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
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
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
      body: JSON.stringify({ email_id: id }),
    });
    const result = await res.json();

    set((s) => ({
      selectedMail: { ...s.selectedMail, summary: result.data },
      mails: s.mails.map((m) => (m.id === id ? { ...m, summary: result.data } : m)),
      isAnalyzing: false,
    }));
  },

  generateAIDraft: async (id) => {
    set({ isAnalyzing: true });
    const res = await fetch(`${EDGE_URL}/generate-reply`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
      body: JSON.stringify({ email_id: id }),
    });
    const result = await res.json();

    set((s) => ({
      selectedMail: { ...s.selectedMail, ai_draft: result.data },
      mails: s.mails.map((m) => (m.id === id ? { ...m, ai_draft: result.data } : m)),
      isAnalyzing: false,
    }));
  },

  autoScanMail: async (mail) => {
    if (!mail?.id) return;
    if (mail.folder !== "Inbox") return;
    if (mail.phishing_score !== null && mail.phishing_score !== undefined) return;
    if (autoScanInFlight.has(mail.id)) return;

    autoScanInFlight.add(mail.id);

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
      const quarantineReason = reasons.join(" | ");

      await supabase
        .from("emails")
        .update({
          phishing_score: score,
          quarantine_status: shouldQuarantine,
          quarantine_reason: quarantineReason,
        })
        .eq("id", mail.id);

      set((s) => ({
        mails: s.mails.map((m) =>
          m.id === mail.id
            ? { ...m, phishing_score: score, quarantine_status: shouldQuarantine, quarantine_reason: quarantineReason }
            : m
        ),
        selectedMail: s.selectedMail?.id === mail.id
          ? { ...s.selectedMail, phishing_score: score, quarantine_status: shouldQuarantine, quarantine_reason: quarantineReason }
          : s.selectedMail,
      }));

      if (shouldQuarantine && mySupabase) {
        await mySupabase.from("quarantine_logs").insert({
          email_id: mail.id,
          sender: mail.sender || "",
          subject: mail.subject || "",
          phishing_score: score,
          risk_level: data.risk_level,
          reasons: quarantineReason,
          action: "quarantined",
        });
      }

      console.log(`[PhishGuard] ${mail.sender} -> Score: ${score} -> ${shouldQuarantine ? "QUARANTINED" : "SAFE"}`);
    } catch (err) {
      console.error("[PhishGuard] Auto-scan failed:", err.message);
    } finally {
      autoScanInFlight.delete(mail.id);
    }
  },

  releaseMail: async (id) => {
    await supabase
      .from("emails")
      .update({ quarantine_status: false, quarantine_reason: null })
      .eq("id", id);

    if (mySupabase) {
      await mySupabase.from("quarantine_logs").insert({
        email_id: id,
        action: "released",
        phishing_score: null,
        risk_level: "released",
      });
    }

    set((s) => ({
      mails: s.mails.map((m) =>
        m.id === id ? { ...m, quarantine_status: false, quarantine_reason: null } : m
      ),
      selectedMail: s.selectedMail?.id === id
        ? { ...s.selectedMail, quarantine_status: false, quarantine_reason: null }
        : s.selectedMail,
    }));
  },

  deleteMail: async (id) => {
    await supabase.from("emails").delete().eq("id", id);

    if (mySupabase) {
      await mySupabase.from("quarantine_logs").insert({
        email_id: id,
        action: "deleted",
        phishing_score: null,
        risk_level: "deleted",
      });
    }

    set((s) => ({
      mails: s.mails.filter((m) => m.id !== id),
      selectedMail: s.selectedMail?.id === id ? null : s.selectedMail,
    }));
  },

  subscribeToMails: () => {
    const channel = supabase
      .channel("mail-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "emails" }, (payload) => {
        const { eventType, new: newRecord, old: oldRecord } = payload;
        const normalizedNewRecord = newRecord ? normalizeMail(newRecord) : null;

        set((state) => {
          let updatedMails = [...state.mails];
          let selectedMail = state.selectedMail;

          if (eventType === "INSERT") {
            if (!updatedMails.some((m) => m.id === normalizedNewRecord.id)) {
              updatedMails = [normalizedNewRecord, ...updatedMails];
            }
          } else if (eventType === "UPDATE") {
            updatedMails = updatedMails.map((m) =>
              m.id === normalizedNewRecord.id ? { ...m, ...normalizedNewRecord } : m
            );

            if (state.selectedMail?.id === normalizedNewRecord.id) {
              selectedMail = { ...state.selectedMail, ...normalizedNewRecord };
            }
          } else if (eventType === "DELETE") {
            updatedMails = updatedMails.filter((m) => m.id !== oldRecord.id);
            selectedMail = state.selectedMail?.id === oldRecord.id ? null : state.selectedMail;
          }

          return { mails: updatedMails, selectedMail };
        });

        if (
          eventType === "INSERT" &&
          normalizedNewRecord?.folder === "Inbox" &&
          normalizedNewRecord?.phishing_score === null
        ) {
          get().autoScanMail(normalizedNewRecord);
        }
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  },
}));
