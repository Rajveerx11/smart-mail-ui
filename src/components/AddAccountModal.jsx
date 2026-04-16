import { X } from "lucide-react";
import { useMailStore } from "../store/mailStore";

export default function AddAccountModal() {
  const { isAddAccountOpen, closeAddAccount } = useMailStore();
  if (!isAddAccountOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/40 flex items-center justify-center z-50">
      <div className="bg-white w-[380px] rounded-lg p-6 shadow-xl profile-dropdown border border-slate-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold text-slate-950">Add another account</h2>
          <button
            onClick={closeAddAccount}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="Close add account dialog"
          >
            <X size={18} />
          </button>
        </div>

        <input
          placeholder="Email"
          className="w-full border border-slate-200 px-3 py-2 mb-3 rounded-lg text-sm focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100"
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full border border-slate-200 px-3 py-2 mb-4 rounded-lg text-sm focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100"
        />

        <button className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-blue-700">
          Add Account
        </button>
      </div>
    </div>
  );
}
