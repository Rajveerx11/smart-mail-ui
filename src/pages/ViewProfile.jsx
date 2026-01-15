import { useMailStore } from "../store/mailStore";
import { useState } from "react";

export default function ViewProfile() {
  const { user, updateUser, logout } = useMailStore();
  const [preview, setPreview] = useState(user.photo);

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    const url = URL.createObjectURL(file);
    setPreview(url);
    updateUser({ photo: url });
  };

  return (
    <div className="max-w-xl mx-auto mt-10 bg-white p-6 rounded-xl shadow-xl">
      <h2 className="text-xl font-semibold mb-6">Profile</h2>

      <div className="flex items-center gap-4 mb-6">
        <div className="w-20 h-20 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center text-2xl">
          {preview ? (
            <img src={preview} className="w-full h-full object-cover" />
          ) : (
            user.name.charAt(0)
          )}
        </div>

        <input type="file" onChange={handlePhoto} />
      </div>

      <div className="mb-4">
        <div className="font-medium">{user.name}</div>
        <div className="text-gray-500">{user.email}</div>
      </div>

      <button className="w-full py-2 border rounded mb-2">
        Manage account
      </button>

      <button className="w-full py-2 border rounded mb-2">
        Add another account
      </button>

      <button
        onClick={logout}
        className="w-full py-2 bg-red-600 text-white rounded"
      >
        Sign out
      </button>
    </div>
  );
}
