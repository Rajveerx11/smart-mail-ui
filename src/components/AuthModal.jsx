import { X } from "lucide-react";
import { useMailStore } from "../store/mailStore";

export default function AuthModal() {
  const { authView, closeAuthView, user, logout } = useMailStore();

  if (!authView) return null;

  const displayName = user?.user_metadata?.name || user?.email?.split("@")[0] || "User";
  const email = user?.email || "No email available";

  const handleSignOut = async () => {
    await logout?.();
    closeAuthView?.();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/40 flex items-center justify-center z-50">
      <div className="bg-white w-[420px] rounded-lg shadow-2xl p-6 profile-dropdown border border-slate-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-slate-950">
            {authView === "manage" && "Account"}
            {authView === "add" && "Add another account"}
            {authView === "signout" && "Sign out"}
          </h2>
          <button
            onClick={closeAuthView}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        {authView === "manage" && (
          <div className="space-y-3">
            <p className="text-sm text-slate-600">Signed in as</p>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div className="font-medium text-slate-900">{displayName}</div>
              <div className="text-sm text-slate-500">{email}</div>
            </div>
            <button className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-blue-700">
              Manage account settings
            </button>
          </div>
        )}

        {authView === "add" && (
          <div className="space-y-3">
            <input
              placeholder="Email"
              className="w-full border border-slate-200 px-3 py-2 rounded-lg text-sm focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full border border-slate-200 px-3 py-2 rounded-lg text-sm focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
            <button className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-blue-700">
              Add account
            </button>
          </div>
        )}

        {authView === "signout" && (
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Are you sure you want to sign out?
            </p>
            <div className="flex gap-3">
              <button
                onClick={closeAuthView}
                className="flex-1 border border-slate-200 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSignOut}
                className="flex-1 bg-red-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-red-700"
              >
                Sign out
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
