import { useEffect, useRef } from "react";
import { useMailStore } from "./store/mailStore";

// UI COMPONENTS
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

// !!! CRITICAL: Ensure this path and filename are 100% correct !!!
import LoginPage from "./components/LoginPage";

export default function App() {
  const {
    user,
    initializeAuth,
    subscribeToMails,
    fetchMails,
    isLoading,
    error
  } = useMailStore();

  // Prevents the "Infinite Loop" by locking initialization to a single run
  const isInitialized = useRef(false);

  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;

    let authSub = null;
    let mailSub = null;

    const setup = async () => {
      // 1. Initialize Auth (Session + Listener)
      authSub = await initializeAuth();

      // 2. Initialize Realtime (Only if user exists)
      mailSub = subscribeToMails();
    };

    setup();

    return () => {
      if (authSub && typeof authSub.unsubscribe === 'function') {
        authSub.unsubscribe();
      }
      if (mailSub && typeof mailSub === 'function') {
        mailSub();
      }
    };
  }, []); // Keep this array empty!

  // Routing Logic
  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden font-sans">
      <Topbar />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar />

        <div className="flex flex-1 flex-col bg-white">
          <MailTabs />

          {/* GLOBAL STATUS BAR */}
          <div className="px-4">
            {isLoading && (
              <div className="flex items-center gap-2 py-2 text-blue-600 bg-blue-50 rounded px-3 mt-2 animate-pulse">
                <div className="h-3 w-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Updating Inbox...</span>
              </div>
            )}
            {error && (
              <div className="py-2 px-3 bg-red-50 text-red-600 rounded mt-2 text-[10px] font-bold border border-red-100 flex justify-between items-center">
                <span>SYNC ERROR: {error}</span>
                <button onClick={fetchMails} className="underline uppercase">Retry</button>
              </div>
            )}
          </div>

          <div className="flex flex-1 overflow-hidden">
            <MailList />
            <MailView />
          </div>
        </div>
      </div>

      {/* MODALS */}
      <ComposeModal />
      <AdvancedSearch />
      <AddAccountModal />
      <SignOutModal />
      <AuthModal />
      <ManageAccountModal />
    </div>
  );
}