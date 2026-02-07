import { useMailStore } from "../store/mailStore";
import { useState } from "react";
import { Camera, Edit2, Check, X, Loader2, LogOut, AlertCircle } from "lucide-react";

export default function ViewProfile() {
  const { user, updateUser, logout, uploadProfilePhoto } = useMailStore();
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(user?.user_metadata?.name || user?.email?.split('@')[0] || "");
  const [isUploading, setIsUploading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Get current photo from user metadata or use default
  const currentPhoto = user?.user_metadata?.photo;

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setError(null);
    setSuccess(null);
    setIsUploading(true);

    const result = await uploadProfilePhoto(file);

    if (result.success) {
      setSuccess("Profile photo updated successfully!");
      setTimeout(() => setSuccess(null), 3000);
    } else {
      setError(result.error || "Failed to upload photo");
    }

    setIsUploading(false);
  };

  const handleNameSave = async () => {
    if (!newName.trim()) {
      setError("Name cannot be empty");
      return;
    }

    setError(null);
    setSuccess(null);
    setIsUpdating(true);

    const result = await updateUser({ name: newName.trim() });

    if (result.success) {
      setSuccess("Name updated successfully!");
      setIsEditingName(false);
      setTimeout(() => setSuccess(null), 3000);
    } else {
      setError(result.error || "Failed to update name");
    }

    setIsUpdating(false);
  };

  const handleLogout = async () => {
    const result = await logout();
    if (!result.success) {
      setError(result.error || "Failed to logout");
    }
    // User will be redirected automatically by App.jsx
  };

  const displayName = user?.user_metadata?.name || user?.email?.split('@')[0] || "User";

  return (
    <div className="max-w-2xl mx-auto mt-10 bg-white rounded-2xl shadow-xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 h-32"></div>

      {/* Profile Content */}
      <div className="px-8 pb-8">
        {/* Profile Photo */}
        <div className="relative -mt-16 mb-6">
          <div className="w-32 h-32 rounded-full bg-white p-2 shadow-lg">
            <div className="w-full h-full rounded-full bg-gray-200 overflow-hidden flex items-center justify-center text-4xl font-semibold text-gray-600">
              {currentPhoto ? (
                <img src={currentPhoto} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                displayName.charAt(0).toUpperCase()
              )}
            </div>
          </div>

          {/* Upload Photo Button */}
          <label
            htmlFor="photo-upload"
            className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3 shadow-lg cursor-pointer transition-colors disabled:opacity-50"
          >
            {isUploading ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <Camera size={20} />
            )}
          </label>
          <input
            id="photo-upload"
            type="file"
            accept="image/*"
            onChange={handlePhotoUpload}
            className="hidden"
            disabled={isUploading}
          />
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200 flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-50 text-green-700 text-sm rounded-lg border border-green-200 flex items-center gap-2">
            <Check size={16} className="shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Name Section */}
        <div className="mb-6">
          {isEditingName ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="flex-1 text-2xl font-semibold border-b-2 border-blue-600 focus:outline-none px-2 py-1"
                autoFocus
                disabled={isUpdating}
              />
              <button
                onClick={handleNameSave}
                disabled={isUpdating}
                className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                {isUpdating ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
              </button>
              <button
                onClick={() => {
                  setIsEditingName(false);
                  setNewName(displayName);
                  setError(null);
                }}
                disabled={isUpdating}
                className="p-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-semibold text-gray-800">{displayName}</h2>
              <button
                onClick={() => setIsEditingName(true)}
                className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Edit name"
              >
                <Edit2 size={18} />
              </button>
            </div>
          )}
          <p className="text-gray-500 mt-1">{user?.email}</p>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 my-6"></div>

        {/* Account Actions */}
        <div className="space-y-3">
          <button className="w-full py-3 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-left font-medium text-gray-700">
            Manage Account
          </button>

          <button className="w-full py-3 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-left font-medium text-gray-700">
            Add Another Account
          </button>

          <button
            onClick={handleLogout}
            className="w-full py-3 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center justify-center gap-2"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
