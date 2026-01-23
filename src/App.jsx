import { useEffect } from "react";
import { useMailStore } from "./store/mailStore";
import { supabase } from "./lib/supabase";

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
// import SplashScreen from "./components/SplashScreen"; // Clean up if unused

export default function App() {
  // Use global state from our store
  const {
    user,
    setUser,
    fetchMails,
    subscribeToMails,
    isLoading, // Kept heavily requested UI state
    error      // Kept heavily requested UI state
  } = useMailStore();

  useEffect(() => {
    let realtimeSubscription = null;

    // 1. Check if a user is already logged in on load
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(session.user);
        fetchMails();
      }
    });

    // 2. Listen for Sign In / Sign Out events
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setUser(session.user);
        fetchMails();
        // Prevent duplicate subscriptions if one already exists
        if (!realtimeSubscription) {
          realtimeSubscription = subscribeToMails();
        }
      } else {
        setUser(null);
        if (realtimeSubscription) {
          realtimeSubscription.unsubscribe();
          realtimeSubscription = null;
        }
      }
    });

    return () => {
      subscription.unsubscribe();
      if (realtimeSubscription) {
        realtimeSubscription.unsubscribe();
      }
    };
  }, [setUser, fetchMails, subscribeToMails]);

  // Logic for Routing
  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      <Topbar />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar />

        <div className="flex flex-1 flex-col bg-white">
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