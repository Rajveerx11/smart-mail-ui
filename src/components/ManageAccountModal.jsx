import { X, User, Shield, Lock } from "lucide-react";
import { useMailStore } from "../store/mailStore";

export default function ManageAccountModal() {
  const {
    isManageAccountOpen,
    closeManageAccount,
    user,
  } = useMailStore();

  if (!isManageAccountOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-[520px] rounded-2xl shadow-2xl animate-scaleFade">

        {/* HEADER */}
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <h2 className="text-lg font-medium">
            Google Account
          </h2>
          <button onClick={closeManageAccount}>
            <X size={18} />
          </button>
        </div>

        {/* USER INFO */}
        <div className="p-6 flex gap-4 items-center border-b">
          <div className="w-16 h-16 rounded-full bg-blue-600 text-white
          flex items-center justify-center text-2xl font-semibold">
            {user.name.charAt(0)}
          </div>

          <div>
            <div className="font-medium">{user.name}</div>
            <div className="text-sm text-gray-500">{user.email}</div>
          </div>
        </div>

        {/* OPTIONS */}
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-100 cursor-pointer">
            <User size={20} />
            <div>
              <div className="font-medium text-sm">Personal info</div>
              <div className="text-xs text-gray-500">
                Name, profile photo
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-100 cursor-pointer">
            <Lock size={20} />
            <div>
              <div className="font-medium text-sm">Security</div>
              <div className="text-xs text-gray-500">
                Password, devices
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-100 cursor-pointer">
            <Shield size={20} />
            <div>
              <div className="font-medium text-sm">
                Privacy & protection
              </div>
              <div className="text-xs text-gray-500">
                Data, personalization
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="px-6 py-4 border-t flex justify-end">
          <button
            onClick={closeManageAccount}
            className="text-blue-600 text-sm hover:underline"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
