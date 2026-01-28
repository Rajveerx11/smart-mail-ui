import { useEffect } from "react";
import { useMailStore } from "./store/mailStore";
import { supabase } from "./store/mailStore";

// UI Components
import Topbar from "./components/Topbar";
import Sidebar from "./components/Sidebar";
import MailTabs from "./components/MailTabs";
import MailList from "./components/MailList";
import MailView from "./components/MailView";
import ComposeModal from "./components/ComposeModal";
import AdvancedSearch from "./components/AdvancedSearch";
import AddAccountModal from "./components/AddAccountModal";
import SignOutModal from "./components/SignOutModal";
import AuthModal from "./components/AuthModal";
import ManageAccountModal from "./components/ManageAccountModal";
import LoginPage from "./components/LoginPage";

// NOTE: We no longer import { supabase } here to avoid Multiple Instance warnings.
// We will use the instance already inside the mailStore.

export default function App() {
  const {
    user,
    setUser,
    fetchMails,
    subscribeToMails,
    isLoading,
    error,
    initializeAuth // We will add this to the store to handle the initial session
  } = useMailStore();

  useEffect(() => {
    let unsubscribeRealtime = null;

    /**
     * AUTH INITIALIZATION
     * We handle session check and auth state changes in one place.
     */
    const initApp = async () => {
      // Use a single helper from the store to handle auth setup
      const { subscription } = await initializeAuth();

      return subscription;
    };

    const authPromise = initApp();

    /**
     * REALTIME INITIALIZATION
     * Only subscribe if the user exists.
     */
    if (user && !unsubscribeRealtime) {
      unsubscribeRealtime = subscribeToMails();
    }

    return () => {
      // Cleanup Auth Listener
      authPromise.then(sub => sub?.unsubscribe());

      // Cleanup Realtime Listener
      if (unsubscribeRealtime) {
        unsubscribeRealtime();
      }
    };
  }, [user, setUser, fetchMails, subscribeToMails]);

  // Routing Logic
  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden font-sans">
      <Topbar />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar />

        <div className="flex flex-1 flex-col bg-white shadow-inner">
          <MailTabs />

          {/* SYSTEM MESSAGES */}
          <div className="px-4">
            {isLoading && (
              <div className="flex items-center gap-3 py-3 text-indigo-600 bg-indigo-50/50 rounded-lg px-4 mt-2 animate-pulse">
                <div className="h-4 w-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs font-bold uppercase tracking-widest">Syncing Inbox...</span>
              </div>
            )}

            {error && (
              <div className="flex items-center justify-between py-3 bg-red-50 text-red-700 rounded-lg px-4 mt-2 border border-red-100">
                <p className="text-xs font-medium">Sync Error: {error}</p>
                <button
                  onClick={fetchMails}
                  className="text-[10px] font-bold uppercase bg-red-600 text-white px-3 py-1 rounded-full hover:bg-red-700 transition-colors"
                >
                  Retry
                </button>
              </div>
            )}
          </div>

          <div className="flex flex-1 overflow-hidden">
            <MailList />
            <MailView />
          </div>
        </div>
      </div>

      {/* MODALS & OVERLAYS */}
      <ComposeModal />
      <AdvancedSearch />
      <AddAccountModal />
      <SignOutModal />
      <AuthModal />
      <ManageAccountModal />
    </div>
  );
}