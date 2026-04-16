import { X } from "lucide-react";
import { useMailStore } from "../store/mailStore";

export default function SignOutModal() {
  const { isSignOutOpen, closeSignOut, logout } = useMailStore();

  if (!isSignOutOpen) return null;

  const handleSignOut = async () => {
    await logout();
    closeSignOut();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/40 flex items-center justify-center z-50">
      <div className="bg-white w-[360px] rounded-lg p-6 shadow-xl profile-dropdown border border-slate-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold text-slate-950">Sign out</h2>
          <button
            onClick={closeSignOut}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="Close sign out dialog"
          >
            <X size={18} />
          </button>
        </div>

        <p className="text-sm text-slate-600 mb-5">
          Are you sure you want to sign out?
        </p>

        <div className="flex gap-3">
          <button
            onClick={closeSignOut}
            className="flex-1 border border-slate-200 rounded-lg py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSignOut}
            className="flex-1 bg-red-600 text-white rounded-lg py-2 text-sm font-semibold hover:bg-red-700"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
