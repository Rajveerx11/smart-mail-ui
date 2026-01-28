import { useEffect, useRef } from "react";
import { useMailStore } from "./store/mailStore";

// UI Imports (Topbar, Sidebar, etc.)
// ... (same imports as before) ...

export default function App() {
  const user = useMailStore((s) => s.user);
  const initializeAuth = useMailStore((s) => s.initializeAuth);
  const subscribeToMails = useMailStore((s) => s.subscribeToMails);
  const fetchMails = useMailStore((s) => s.fetchMails);
  const isLoading = useMailStore((s) => s.isLoading);
  const error = useMailStore((s) => s.error);

  // Use a Ref to ensure we only subscribe once ever
  const isInitialized = useRef(false);

  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;

    let authSub = null;
    let mailSub = null;

    const setup = async () => {
      // 1. Start Auth (Sets user and fetches initial mails)
      authSub = await initializeAuth();

      // 2. Start Realtime
      mailSub = subscribeToMails();
    };

    setup();

    return () => {
      if (authSub) authSub.unsubscribe();
      if (mailSub) mailSub();
    };
  }, []); // EMPTY ARRAY is critical here to stop the infinite loop

  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      <Topbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <div className="flex flex-1 flex-col bg-white">
          <MailTabs />

          {/* Status Indicators */}
          {isLoading && <div className="p-2 text-center text-xs text-blue-500 animate-pulse">Syncing...</div>}

          <div className="flex flex-1 overflow-hidden">
            <MailList />
            <MailView />
          </div>
        </div>
      </div>
      <ComposeModal />
      <AddAccountModal />
      <SignOutModal />
      {/* ... other modals */}
    </div>
  );
}