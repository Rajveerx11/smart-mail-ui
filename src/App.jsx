import { useEffect } from "react";
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
import { useMailStore } from "./store/mailStore";

export default function App() {
  const fetchMails = useMailStore((s) => s.fetchMails);
  const subscribeToEmails = useMailStore((s) => s.subscribeToEmails);
  const unsubscribeFromEmails = useMailStore((s) => s.unsubscribeFromEmails);
  const isLoading = useMailStore((s) => s.isLoading);
  const error = useMailStore((s) => s.error);

  // Initialize: Fetch emails and set up real-time subscription
  useEffect(() => {
    fetchMails();
    subscribeToEmails();

    // Cleanup subscription on unmount
    return () => {
      unsubscribeFromEmails();
    };
  }, []);

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      <Topbar />

      <div className="flex flex-1 overflow-hidden">
        {/* LEFT ICON SIDEBAR */}
        <Sidebar />

        {/* RIGHT MAIN CONTENT (TABS + MAILS) */}
        <div className="flex flex-1 flex-col bg-white">
          {/* TABS (START AFTER SIDEBAR) */}
          <MailTabs />

          {/* Loading/Error States */}
          {isLoading && (
            <div className="flex items-center justify-center p-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className="ml-2 text-gray-500">Loading emails...</span>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 m-2">
              <p className="text-red-700">Error: {error}</p>
              <button
                onClick={fetchMails}
                className="mt-2 text-sm text-red-600 underline"
              >
                Retry
              </button>
            </div>
          )}

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
