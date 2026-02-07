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

  // Update user profile (name, metadata)
  updateUser: async (updates) => {
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: updates // updates can include { name, photo, etc. }
      });

      if (error) throw error;

      // Update local state with new user data
      set({ user: data.user });
      return { success: true };
    } catch (err) {
      console.error("Update user error:", err.message);
      return { success: false, error: err.message };
    }
  },

  // Logout user
  logout: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      // Clear all state
      set({ user: null, mails: [], selectedMail: null });
      return { success: true };
    } catch (err) {
      console.error("Logout error:", err.message);
      return { success: false, error: err.message };
    }
  },

  // Upload profile photo to Supabase Storage
  uploadProfilePhoto: async (file) => {
    try {
      const user = get().user;
      if (!user) throw new Error("No user logged in");

      // Validate file
      if (!file.type.startsWith('image/')) {
        throw new Error("Please select a valid image file");
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        throw new Error("Image size must be less than 5MB");
      }

      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}_${Date.now()}.${fileExt}`;
      const filePath = `profile-photos/${fileName}`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('profile-photos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(filePath);

      // Update user metadata with photo URL
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