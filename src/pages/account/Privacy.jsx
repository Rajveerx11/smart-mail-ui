import { X } from "lucide-react";
import { useMailStore } from "../../store/mailStore";

export default function Privacy() {
  const { closeAccountTab } = useMailStore();

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <div className="bg-white w-[500px] rounded-xl shadow-xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium">Privacy & Protection</h2>
          <button onClick={closeAccountTab}><X size={18} /></button>
        </div>

        <p className="text-sm text-gray-600">
          Data, personalization & controls
        </p>
      </div>
    </div>
  );
}
