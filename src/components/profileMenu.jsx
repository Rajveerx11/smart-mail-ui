import { X } from "lucide-react";
import { useMailStore } from "../store/mailStore";

export default function ProfileMenu() {
  const {
    user,
    closeProfile,
    openAddAccount,
    openSignOut,
  } = useMailStore();

  // Derive Display Name safely
  const displayName = user?.user_metadata?.name || user?.email || "User";
  const userInitial = displayName.charAt(0).toUpperCase();

  return (
    <div className="
      absolute right-0 mt-3 w-80
      bg-[#eef3fd] rounded-2xl
      shadow-2xl p-4
      animate-scaleFade
      z-50
    ">
      {/* HEADER */}
      <div className="flex justify-between">
        <span className="text-sm text-gray-600">{user?.email}</span>
        <button onClick={closeProfile}>
          <X size={16} />
        </button>
      </div>

      {/* AVATAR */}
      <div className="flex flex-col items-center mt-4">
        <div className="
          w-20 h-20 rounded-full bg-blue-600
          text-white flex items-center justify-center
          text-3xl shadow-lg
        ">
          {userInitial}
        </div>

        <h2 className="mt-3 text-lg font-medium">
          Hi, {displayName}!
        </h2>

        <button className="
          mt-3 border border-blue-600
          text-blue-600 px-4 py-1
          rounded-full text-sm
          hover:bg-blue-50 transition
        ">
          Manage your Google Account
        </button>
      </div>

      {/* ACTIONS */}
      <div className="mt-5 grid grid-cols-2 gap-3">
        <button
          onClick={openAddAccount}
          className="bg-white py-2 rounded-full shadow hover:shadow-md transition"
        >
          Add account
        </button>

        <button
          onClick={openSignOut}
          className="bg-white py-2 rounded-full shadow text-red-600 hover:shadow-md transition"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
