import {
  X,
  Plus,
  LogOut,
  Settings,
} from "lucide-react";
import { useMailStore } from "../store/mailStore";

export default function ProfileMenu() {
  const {
    user,
    closeProfile,
    openAddAccount,
    openSignOut,
  } = useMailStore();

  return (
    <div className="
      absolute right-0 mt-3 w-80
      bg-white rounded-2xl
      shadow-2xl border
      animate-scaleFade z-50
    ">
      {/* HEADER */}
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <span className="text-sm text-gray-600">
          {user.email}
        </span>
        <button onClick={closeProfile}>
          <X size={18} />
        </button>
      </div>

      {/* AVATAR */}
      <div className="flex flex-col items-center py-5">
        <div className="
          w-20 h-20 rounded-full bg-blue-600
          text-white flex items-center justify-center
          text-3xl font-semibold shadow-lg
        ">
          {user.name[0]}
        </div>

        <h2 className="mt-3 font-medium text-lg">
          Hi, {user.name}
        </h2>

        <button
          className="
            mt-3 px-5 py-1.5 text-sm
            border rounded-full
            hover:bg-gray-100 transition
          "
        >
          Manage your Account
        </button>
      </div>

      {/* ACTIONS */}
      <div className="border-t">
        <button
          onClick={openAddAccount}
          className="
            w-full flex items-center gap-3
            px-5 py-3 text-sm
            hover:bg-gray-100 transition
          "
        >
          <Plus size={18} />
          Add another account
        </button>

        <button
          onClick={openSignOut}
          className="
            w-full flex items-center gap-3
            px-5 py-3 text-sm text-red-600
            hover:bg-red-50 transition
          "
        >
          <LogOut size={18} />
          Sign out
        </button>
      </div>
    </div>
  );
}
