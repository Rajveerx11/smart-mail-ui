import { Lock, Shield, User, X } from "lucide-react";
import { useMailStore } from "../store/mailStore";

export default function ManageAccountModal() {
  const {
    isManageAccountOpen,
    closeManageAccount,
    user,
  } = useMailStore();

  if (!isManageAccountOpen) return null;

  const displayName = user?.user_metadata?.name || user?.email?.split("@")[0] || "User";
  const email = user?.email || "No email available";

  const options = [
    { icon: User, title: "Personal info", subtitle: "Name and profile photo" },
    { icon: Lock, title: "Security", subtitle: "Password and active devices" },
    { icon: Shield, title: "Privacy and protection", subtitle: "Data and mail safety" },
  ];

  return (
    <div className="fixed inset-0 bg-slate-950/40 flex items-center justify-center z-50">
      <div className="bg-white w-[520px] rounded-lg shadow-2xl profile-dropdown border border-slate-200">
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-950">Account</h2>
          <button
            onClick={closeManageAccount}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="Close account dialog"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 flex gap-4 items-center border-b border-slate-200">
          <div className="w-16 h-16 rounded-lg bg-blue-600 text-white flex items-center justify-center text-2xl font-semibold">
            {displayName.charAt(0).toUpperCase()}
          </div>

          <div className="min-w-0">
            <div className="font-semibold text-slate-950 truncate">{displayName}</div>
            <div className="text-sm text-slate-500 truncate">{email}</div>
          </div>
        </div>

        <div className="p-4 space-y-1">
          {options.map((option) => {
            const Icon = option.icon;
            return (
              <button
                key={option.title}
                className="w-full flex items-center gap-4 p-3 rounded-lg hover:bg-slate-50 cursor-pointer text-left"
              >
                <Icon size={20} className="text-slate-500" />
                <div>
                  <div className="font-medium text-sm text-slate-800">{option.title}</div>
                  <div className="text-xs text-slate-500">{option.subtitle}</div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="px-6 py-4 border-t border-slate-200 flex justify-end">
          <button
            onClick={closeManageAccount}
            className="text-blue-600 text-sm font-semibold hover:text-blue-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
