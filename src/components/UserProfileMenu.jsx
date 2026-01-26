import { X, LogOut, User, Camera } from "lucide-react";
import { useMailStore } from "../store/mailStore";
import { useRef, useState } from "react";

export default function UserProfileMenu() {
  const { user, isProfileOpen, closeProfile } = useMailStore();
  const fileRef = useRef(null);
  const [profileImg, setProfileImg] = useState(null);

  if (!isProfileOpen) return null;

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setProfileImg(URL.createObjectURL(file));
  };

  return (
    <>
      {/* CLICK OUTSIDE */}
      <div className="fixed inset-0 z-40" onClick={closeProfile} />

      {/* DROPDOWN */}
      <div className="absolute right-4 top-16 z-50 w-80 bg-white
        rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.2)] border">

        {/* HEADER */}
        <div className="flex justify-between items-center px-4 py-3 border-b">
          <span className="font-medium text-sm">Google Account</span>
          <button onClick={closeProfile}>
            <X size={18} />
          </button>
        </div>

        {/* PROFILE INFO */}
        <div className="flex flex-col items-center py-5">

          {/* PROFILE IMAGE */}
          <div className="relative">
            {profileImg ? (
              <img
                src={profileImg}
                className="w-20 h-20 rounded-full object-cover shadow-lg"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-blue-600
                text-white flex items-center justify-center text-3xl font-semibold shadow-lg">
                {user.name.charAt(0)}
              </div>
            )}

            {/* CAMERA ICON */}
            <button
              onClick={() => fileRef.current.click()}
              className="absolute bottom-0 right-0 bg-blue-600 text-white
              p-1.5 rounded-full hover:bg-blue-700"
            >
              <Camera size={14} />
            </button>

            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              hidden
              onChange={handleImageChange}
            />
          </div>

          <h3 className="mt-3 font-medium">{user.name}</h3>
          <p className="text-sm text-gray-500">{user.email}</p>

          <button className="mt-4 px-4 py-1.5 text-sm border rounded-full
            hover:bg-gray-100">
            Manage your Google Account
          </button>
        </div>

        {/* ACTIONS */}
        <div className="border-t">
          <button className="flex items-center gap-3 px-5 py-3 w-full
            hover:bg-gray-100 text-sm">
            <User size={18} /> Profile
          </button>

          <button className="flex items-center gap-3 px-5 py-3 w-full
            hover:bg-gray-100 text-sm text-red-600">
            <LogOut size={18} /> Sign out
          </button>
        </div>
      </div>
    </>
  );
}
