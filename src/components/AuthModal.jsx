import { X } from "lucide-react";
import { useMailStore } from "../store/mailStore";

export default function AuthModal() {
  const { authView, closeAuthView, user } = useMailStore();

  if (!authView) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-[420px] rounded-2xl shadow-2xl p-6 animate-scaleFade">

        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium">
            {authView === "manage" && "Google Account"}
            {authView === "add" && "Add another account"}
            {authView === "signout" && "Sign out"}
          </h2>
          <button onClick={closeAuthView}>
            <X size={18} />
          </button>
        </div>

        {/* MANAGE ACCOUNT */}
        {authView === "manage" && (
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              Signed in as
            </p>
            <div className="p-3 bg-gray-100 rounded-lg">
              <div className="font-medium">{user.name}</div>
              <div className="text-sm text-gray-500">
                {user.email}
              </div>
            </div>
            <button className="w-full bg-blue-600 text-white py-2 rounded-lg">
              Manage Account Settings
            </button>
          </div>
        )}

        {/* ADD ACCOUNT */}
        {authView === "add" && (
          <div className="space-y-3">
            <input
              placeholder="Email"
              className="w-full border px-3 py-2 rounded"
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full border px-3 py-2 rounded"
            />
            <button className="w-full bg-blue-600 text-white py-2 rounded-lg">
              Add Account
            </button>
          </div>
        )}

        {/* SIGN OUT */}
        {authView === "signout" && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Are you sure you want to sign out?
            </p>
            <div className="flex gap-3">
              <button
                onClick={closeAuthView}
                className="flex-1 border py-2 rounded"
              >
                Cancel
              </button>
              <button
                className="flex-1 bg-red-600 text-white py-2 rounded"
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
