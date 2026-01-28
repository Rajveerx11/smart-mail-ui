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

import PersonalInfo from "./pages/account/PersonalInfo";
import Security from "./pages/account/Security";
import Privacy from "./pages/account/Privacy";
import { useMailStore } from "./store/mailStore";

export default function App() {
  // 🔹 Persisted login state
  const [isLoggedIn, setIsLoggedIn] = useState(
    () => localStorage.getItem("isLoggedIn") === "true"
  );

  const [step, setStep] = useState("splash"); // splash | login | app

  // 🔹 Account tab state (zustand)
  const { activeAccountTab } = useMailStore();

  // 🔹 Splash animation finished
  const handleSplashFinish = () => {
    if (isLoggedIn) {
      setStep("app"); // ✅ AUTO DASHBOARD
    }
  };

  // 🔹 Login success
  const handleLogin = () => {
    localStorage.setItem("isLoggedIn", "true");
    setIsLoggedIn(true);
    setStep("app");
  };

  // 🔹 Splash Screen
  if (step === "splash") {
    return (
      <SplashScreen
        isLoggedIn={isLoggedIn}
        onLogin={() => setStep("login")}
        onFinishSplash={handleSplashFinish}
      />
    );
  }

  // 🔹 Login Page
  if (step === "login") {
    return <LoginPage onLogin={handleLogin} />;
  }

  // 🔹 Main Dashboard
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

      {/* GLOBAL MODALS */}
      <ComposeModal />
      <AdvancedSearch />
      <AddAccountModal />
      <SignOutModal />
      <AuthModal />
      <ManageAccountModal />

    {/* ACCOUNT SUB-PAGES */}
    {activeAccountTab === "personal" && <PersonalInfo />}
    {activeAccountTab === "security" && <Security />}
    {activeAccountTab === "privacy" && <Privacy />}

    </div>
  );
}
