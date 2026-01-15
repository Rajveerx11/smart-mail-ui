import { X } from "lucide-react";
import { useMailStore } from "../store/mailStore";

export default function SignOutModal() {
  const { isSignOutOpen, closeSignOut } = useMailStore();
  if (!isSignOutOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-[340px] rounded-xl p-6 shadow-xl animate-scaleFade">
        <div className="flex justify-between mb-4">
          <h2 className="font-medium">Sign out</h2>
          <button onClick={closeSignOut}>
            <X size={18} />
          </button>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          Are you sure you want to sign out?
        </p>

        <div className="flex gap-3">
          <button
            onClick={closeSignOut}
            className="flex-1 border rounded py-2"
          >
            Cancel
          </button>
          <button className="flex-1 bg-red-600 text-white rounded py-2">
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
