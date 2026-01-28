import { useEffect, useRef } from "react";
import { useMailStore } from "./store/mailStore";

// Original UI Imports
import Topbar from "./components/Topbar";
import Sidebar from "./components/Sidebar";
import MailTabs from "./components/MailTabs";
import MailList from "./components/MailList";
import MailView from "./components/MailView";
import ComposeModal from "./components/ComposeModal";
import AdvancedSearch from "./components/AdvancedSearch";
import LoginPage from "./components/LoginPage";

export default function App() {
  const { user, initializeAuth, subscribeToMails, fetchMails, isLoading } = useMailStore();
  const isInitialized = useRef(false);

  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;

    let authSub = null;
    let mailSub = null;

    const setup = async () => {
      authSub = await initializeAuth();
      mailSub = subscribeToMails();
    };

    setup();
    return () => {
      if (authSub?.unsubscribe) authSub.unsubscribe();
      if (mailSub) mailSub();
    };
  }, []);

  if (!user) return <LoginPage />;

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      <Topbar />

      <div className="flex flex-1 overflow-hidden">
        {/* THIS WAS MISSING: YOUR ORIGINAL SIDEBAR */}
        <Sidebar />

        <div className="flex flex-1 flex-col bg-white">
          {/* THIS WAS MISSING: YOUR ORIGINAL TABS */}
          <MailTabs />

          <div className="flex flex-1 overflow-hidden">
            <MailList />
            <MailView />
          </div>
        </div>
      </div>

      <ComposeModal />
      <AdvancedSearch />
      <AddAccountModal />
      <SignOutModal />
      <AuthModal />
      <ManageAccountModal />
    </div>
  );
}