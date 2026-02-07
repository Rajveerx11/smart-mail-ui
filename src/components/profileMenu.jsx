import { X, Camera, Loader2, LogOut, UserPlus } from "lucide-react";
import { useMailStore } from "../store/mailStore";
import { useState } from "react";

export default function ProfileMenu() {
  const {
    user,
    closeProfile,
    openAddAccount,
    openSignOut,
    uploadProfilePhoto
  } = useMailStore();

  const [isUploading, setIsUploading] = useState(false);

  // Derive Display Name safely
  // Derive Display Name safely
  const getDisplayName = () => {
    if (user?.user_metadata?.name) return user.user_metadata.name;

    // Fallback: Format name from email (e.g., rajveer.vadnal@... -> Rajveer Vadnal)
    const emailName = user?.email?.split('@')[0] || "User";
    return emailName
      .split('.')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  };

  const displayName = getDisplayName();
  const userInitial = displayName.charAt(0).toUpperCase();
  const userPhoto = user?.user_metadata?.photo;

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    await uploadProfilePhoto(file);
    setIsUploading(false);
  };

  return (
    <div className="
      absolute right-0 mt-3 w-[400px]
      bg-white rounded-[2rem]
      shadow-2xl p-8
      animate-scaleFade
      z-50 border border-gray-100
      flex flex-col items-center
    ">
      {/* HEADER */}
      <div className="w-full flex justify-between items-center mb-2">
        <span className="text-xs font-semibold text-gray-400 tracking-wider">ACCOUNT</span>
        <button
          onClick={closeProfile}
          className="p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      {/* AVATAR WITH UPLOAD OVERLAY */}
      <div className="relative group cursor-pointer mb-3">
        <div className="
          w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600
          text-white flex items-center justify-center
          text-4xl shadow-xl overflow-hidden border-4 border-white ring-2 ring-gray-50
        ">
          {userPhoto ? (
            <img src={userPhoto} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <span className="font-bold">{userInitial}</span>
          )}
        </div>

        {/* HOVER OVERLAY */}
        <label
          htmlFor="profile-upload"
          className="
            absolute inset-0 rounded-full bg-black/40 
            flex items-center justify-center opacity-0 
            group-hover:opacity-100 transition-opacity duration-200
            cursor-pointer backdrop-blur-[1px]
          "
        >
          {isUploading ? (
            <Loader2 size={24} className="text-white animate-spin" />
          ) : (
            <Camera size={24} className="text-white drop-shadow-md" />
          )}
        </label>
        <input
          id="profile-upload"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handlePhotoUpload}
          disabled={isUploading}
        />

        {/* EDIT INDICATOR (Small icon always visible) */}
        <div className="absolute bottom-0 right-0 bg-white rounded-full p-1.5 shadow-md border border-gray-100 group-hover:scale-110 transition-transform">
          <Camera size={14} className="text-gray-600" />
        </div>
      </div>

      {/* USER INFO */}
      <h2 className="text-xl font-bold text-gray-800 text-center">
        Hi, {displayName}!
      </h2>
      <p className="text-sm text-gray-500 text-center mt-1 mb-6 px-4 truncate w-full">
        {user?.email}
      </p>

      {/* ACTIONS */}
      <div className="w-full space-y-3">
        <button
          onClick={openAddAccount}
          className="
            w-full flex items-center justify-center gap-3
            py-3 px-4 rounded-xl border border-gray-200
            text-gray-700 font-medium text-sm
            hover:bg-gray-50 hover:border-gray-300 hover:shadow-sm 
            active:scale-[0.98] transition-all duration-200
          "
        >
          <UserPlus size={18} />
          Add another account
        </button>

        <button
          onClick={openSignOut}
          className="
            w-full flex items-center justify-center gap-3
            py-3 px-4 rounded-xl 
            bg-red-50 text-red-600 font-medium text-sm
            hover:bg-red-100 hover:shadow-sm
            active:scale-[0.98] transition-all duration-200
          "
        >
          <LogOut size={18} />
          Sign out
        </button>
      </div>

      {/* FOOTER */}
      <div className="mt-6 text-[10px] text-gray-300 font-medium tracking-widest uppercase">
        Bodhak AI • Axon Mail
      </div>
    </div>
  );
}
