import { X } from "lucide-react";
import { useMailStore } from "../../store/mailStore";

export default function PersonalInfo() {
  const { closeAccountTab, user } = useMailStore();

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <div className="bg-white w-[500px] rounded-xl shadow-xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium">Personal Info</h2>
          <button onClick={closeAccountTab}><X size={18} /></button>
        </div>

        <p className="text-sm text-gray-600">Name: {user.name}</p>
        <p className="text-sm text-gray-600 mt-2">Email: {user.email}</p>
      </div>
    </div>
  );
}
