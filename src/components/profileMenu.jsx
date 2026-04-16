import { Camera, Loader2, LogOut, UserPlus, X } from "lucide-react";
import { useState } from "react";
import { useMailStore } from "../store/mailStore";

export default function ProfileMenu() {
  const {
    user,
    closeProfile,
    openAddAccount,
    openSignOut,
    uploadProfilePhoto,
  } = useMailStore();

  const [isUploading, setIsUploading] = useState(false);

  const getDisplayName = () => {
    if (user?.user_metadata?.name) return user.user_metadata.name;

    const emailName = user?.email?.split("@")[0] || "User";
    return emailName
      .split(".")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
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
    <div className="absolute right-0 mt-3 w-[360px] bg-white rounded-lg shadow-2xl p-6 profile-dropdown z-50 border border-slate-200 flex flex-col items-center">
      <div className="w-full flex justify-between items-center mb-2">
        <span className="text-xs font-semibold text-slate-400 tracking-wider">ACCOUNT</span>
        <button
          onClick={closeProfile}
          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          aria-label="Close profile menu"
        >
          <X size={18} />
        </button>
      </div>

      <div className="relative group cursor-pointer mb-3">
        <div className="w-24 h-24 rounded-lg bg-blue-600 text-white flex items-center justify-center text-4xl shadow-sm overflow-hidden border border-slate-200">
          {userPhoto ? (
            <img src={userPhoto} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <span className="font-semibold">{userInitial}</span>
          )}
        </div>

        <label
          htmlFor="profile-upload"
          className="absolute inset-0 rounded-lg bg-black/45 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer"
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

        <div className="absolute bottom-1 right-1 bg-white rounded-lg p-1.5 shadow-sm border border-slate-200">
          <Camera size={14} className="text-slate-600" />
        </div>
      </div>

      <h2 className="text-xl font-semibold text-slate-950 text-center">
        Hi, {displayName}!
      </h2>
      <p className="text-sm text-slate-500 text-center mt-1 mb-6 px-4 truncate w-full">
        {user?.email}
      </p>

      <div className="w-full space-y-3">
        <button
          onClick={openAddAccount}
          className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-lg border border-slate-200 text-slate-700 font-medium text-sm hover:bg-slate-50 hover:border-slate-300 hover:shadow-sm transition-all duration-200"
        >
          <UserPlus size={18} />
          Add another account
        </button>

        <button
          onClick={openSignOut}
          className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-lg bg-red-50 text-red-600 font-medium text-sm hover:bg-red-100 hover:shadow-sm transition-all duration-200"
        >
          <LogOut size={18} />
          Sign out
        </button>
      </div>

      <div className="mt-6 text-[10px] text-slate-300 font-medium tracking-widest uppercase">
        Bodhak AI - Axon Mail
      </div>
    </div>
  );
}
