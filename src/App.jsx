import { useState } from "react";

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
import SplashScreen from "./components/SplashScreen";
import LoginPage from "./components/LoginPage";

export default function App() {
  // 🔹 App states
  const [step, setStep] = useState("splash"); // splash → login → app
  const [isLoggedIn, setIsLoggedIn] = useState(false); // user login status

  // 🔹 Called when splash animation finishes
  const handleSplashFinish = () => {
    if (isLoggedIn) {
      setStep("app");    // go directly to main app
    } else {
      setStep("login");  // show login page
    }
  };

  // 🔹 Called after login is successful
  const handleLogin = () => {
    setIsLoggedIn(true);
    setStep("app");      // go to main app
  };

  // 🔹 Splash screen step
  if (step === "splash") {
    return (
      <SplashScreen
        isLoggedIn={isLoggedIn}
        onLogin={() => setStep("login")}  // user clicks login
        onFinishSplash={handleSplashFinish} // animation ends
      />
    );
  }

  // 🔹 Login page step
  if (step === "login") {
    return <LoginPage onLogin={handleLogin} />;
  }

  // 🔹 Main dashboard step
  return (
    <div className="h-screen flex flex-col bg-gray-100">
      <Topbar />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar />

        <div className="flex flex-1 flex-col bg-white">
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
