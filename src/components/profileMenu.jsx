import { X, UserPlus, LogOut, Camera } from "lucide-react";
import { useMailStore } from "../store/mailStore";
import { useRef, useState } from "react";

export default function ProfileMenu() {
  const {
    user,
    isProfileOpen,
    closeProfile,
    openAddAccount,     // ✅ already exists
    openSignOut,        // ✅ already exists
    openManageAccount, // ✅ already exists
  } = useMailStore();

  const fileRef = useRef(null);
  const [profileImg, setProfileImg] = useState(null);

  if (!isProfileOpen) return null;

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProfileImg(URL.createObjectURL(file));
  };

  return (
    <>
      {/* BACKDROP */}
      <div
        className="fixed inset-0 z-40"
        onClick={closeProfile}
      />

      {/* MENU */}
      <div
        className="
          absolute right-4 top-16 z-50 w-80
          bg-white rounded-xl border
          shadow-[0_12px_30px_rgba(0,0,0,0.25)]
        "
        onClick={(e) => e.stopPropagation()}
      >
       {/* HEADER */}
      <div className="flex items-center justify-between px-4 py-3 border-b">
        {/* ✅ EMAIL INSTEAD OF ACCOUNT TEXT */}
        <span className="text-sm font-medium text-gray-700">
          {user.email}
        </span>

        <button onClick={closeProfile}>
          <X size={18} />
        </button>
      </div>

        {/* USER INFO */}
        <div className="flex flex-col items-center py-5">
          <div className="relative">
            {profileImg ? (
              <img
                src={profileImg}
                className="w-20 h-20 rounded-full object-cover shadow"
              />
            ) : (
              <div className="
                w-20 h-20 rounded-full bg-blue-600
                text-white flex items-center justify-center
                text-3xl font-semibold shadow
              ">
                {user.name.charAt(0)}
              </div>
            )}

            {/* CAMERA */}
            <button
              onClick={() => fileRef.current.click()}
              className="
                absolute bottom-0 right-0
                bg-blue-600 text-white
                p-1.5 rounded-full
                hover:bg-blue-700
              "
            >
              <Camera size={14} />
            </button>

            <input
              ref={fileRef}
              type="file"
              hidden
              accept="image/*"
              onChange={handleImageChange}
            />
          </div>

          <h3 className="mt-3 font-medium">{user.name}</h3>
          <p className="text-sm text-gray-500">{user.email}</p>

          {/* MANAGE ACCOUNT */}
          <button
            onClick={() => {
              closeProfile();
              openManageAccount();
            }}
            className="
              mt-4 px-4 py-1.5 text-sm
              border rounded-full
              hover:bg-gray-100
            "
          >
            Manage your account
          </button>
        </div>

        {/* ACTIONS */}
        <div className="border-t">
          {/* ADD ACCOUNT */}
          <button
            onClick={() => {
              closeProfile();
              openAddAccount(); // ✅ opens AddAccountModal
            }}
            className="
              flex items-center gap-3
              px-5 py-3 w-full
              hover:bg-gray-100 text-sm
            "
          >
            <UserPlus size={18} />
            Add another account
          </button>

          {/* SIGN OUT */}
          <button
            onClick={() => {
              closeProfile();
              openSignOut(); // ✅ opens SignOutModal
            }}
            className="
              flex items-center gap-3
              px-5 py-3 w-full
              hover:bg-red-50 text-sm text-red-600
            "
          >
            <LogOut size={18} />
            Sign out
          </button>
        </div>
      </div>
    </>
  );
}
