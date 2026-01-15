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



export default function App() {
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
