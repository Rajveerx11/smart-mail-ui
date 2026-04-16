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
import LoginPage from "./components/LoginPage";

// --- THE MISSING IMPORTS FIX ---
import AddAccountModal from "./components/AddAccountModal";
import SignOutModal from "./components/SignOutModal";
import AuthModal from "./components/AuthModal";
import ManageAccountModal from "./components/ManageAccountModal";

export default function App() {
  const {
    user,
    initializeAuth,
    subscribeToMails,
  } = useMailStore();

  const isInitialized = useRef(false);

  useEffect(() => {
    // Only run this ONCE per page load to prevent infinite loops
    if (isInitialized.current) return;
    isInitialized.current = true;

    let authSub = null;
    let mailSub = null;

    const setup = async () => {
      // 1. Initialize Auth via Store (Singleton Instance)
      authSub = await initializeAuth();

      // 2. Initialize Realtime Sync
      mailSub = subscribeToMails();
    };

    setup();

    return () => {
      if (authSub?.unsubscribe) authSub.unsubscribe();
      if (mailSub) mailSub(); // Cleanup realtime
    };
  }, [initializeAuth, subscribeToMails]);

  // Routing Logic
  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[#f5f7fb] text-slate-900">
      <Topbar />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar />

        <main className="flex flex-1 min-w-0 flex-col overflow-hidden bg-white">
          <MailTabs />

          <div className="flex flex-1 min-w-0 overflow-hidden">
            <MailList />
            <MailView />
          </div>
        </main>
      </div>

      {/* MODALS SECTION */}
      <ComposeModal />
      <AdvancedSearch />
      <AddAccountModal />
      <SignOutModal />
      <AuthModal />
      <ManageAccountModal />
    </div>
  );
}
