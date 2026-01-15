import { X } from "lucide-react";
import { useMailStore } from "../store/mailStore";

export default function AddAccountModal() {
  const { isAddAccountOpen, closeAddAccount } = useMailStore();
  if (!isAddAccountOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-[380px] rounded-xl p-6 shadow-xl animate-scaleFade">
        <div className="flex justify-between mb-4">
          <h2 className="font-medium">Add another account</h2>
          <button onClick={closeAddAccount}>
            <X size={18} />
          </button>
        </div>

        <input
          placeholder="Email"
          className="w-full border px-3 py-2 mb-3 rounded"
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full border px-3 py-2 mb-4 rounded"
        />

        <button className="w-full bg-blue-600 text-white py-2 rounded">
          Add Account
        </button>
      </div>
    </div>
  );
}
