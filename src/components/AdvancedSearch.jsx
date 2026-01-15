import { X, Calendar } from "lucide-react";
import { useState } from "react";
import { useMailStore } from "../store/mailStore";

export default function AdvancedSearch() {
  const {
    isSearchPanelOpen,
    closeSearchPanel,
    setAdvancedSearch,
    resetAdvancedSearch,
  } = useMailStore();

  const [focused, setFocused] = useState(null);

  const [form, setForm] = useState({
    from: "",
    to: "",
    subject: "",
    words: "",
    notWords: "",
    folder: "All Mail",
    hasAttachment: false,
    date: "",
    dateRange: "1 day",
  });

  if (!isSearchPanelOpen) return null;

  const closeAndClear = () => {
    resetAdvancedSearch();
    closeSearchPanel();
  };

  const Input = ({ label, keyName }) => (
    <div className="grid grid-cols-[140px_1fr] items-center gap-4">
      <span className="text-sm text-gray-600">{label}</span>
      <input
        value={form[keyName]}
        onChange={(e) =>
          setForm({ ...form, [keyName]: e.target.value })
        }
        onFocus={() => setFocused(label)}
        onBlur={() => setFocused(null)}
        className={`border-b outline-none py-[2px] text-sm ${
          focused === label
            ? "border-blue-600 border-b-2"
            : "border-gray-400"
        }`}
      />
    </div>
  );

  return (
    <>
      {/* OVERLAY (ONLY BACKGROUND CLICK) */}
      <div
        className="fixed inset-0 z-40 bg-transparent"
        onClick={closeAndClear}
      />

      {/* PANEL */}
      <div
        className="fixed top-[64px] left-[260px] z-50 bg-white w-[720px]
        border border-gray-300 shadow-md p-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-sm font-medium">Advanced search</h2>

          {/* ❌ WORKING CLOSE BUTTON */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              closeAndClear();
            }}
            className="p-1 rounded hover:bg-gray-100"
          >
            <X size={18} />
          </button>
        </div>

        {/* FORM */}
        <div className="space-y-3">
          <Input label="From" keyName="from" />
          <Input label="To" keyName="to" />
          <Input label="Subject" keyName="subject" />
          <Input label="Includes the words" keyName="words" />
          <Input label="Doesn't have" keyName="notWords" />

          {/* DATE */}
          <div className="grid grid-cols-[140px_1fr] items-center gap-4">
            <span className="text-sm text-gray-600">Date within</span>

            <div className="flex gap-3 items-center text-sm">
              <select
                className="border-b outline-none"
                value={form.dateRange}
                onChange={(e) =>
                  setForm({ ...form, dateRange: e.target.value })
                }
              >
                <option>1 day</option>
                <option>7 days</option>
                <option>1 month</option>
                <option>1 year</option>
              </select>

              <div className="flex items-center gap-1">
                <Calendar size={16} />
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) =>
                    setForm({ ...form, date: e.target.value })
                  }
                  className="border-b outline-none"
                />
              </div>
            </div>
          </div>

          {/* FOLDER */}
          <div className="grid grid-cols-[140px_1fr] items-center gap-4">
            <span className="text-sm text-gray-600">Search</span>
            <select
              className="border-b outline-none"
              value={form.folder}
              onChange={(e) =>
                setForm({ ...form, folder: e.target.value })
              }
            >
              <option>All Mail</option>
              <option>Inbox</option>
              <option>Sent</option>
              <option>Spam</option>
            </select>
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex justify-end gap-6 mt-4">
          <button
            className="text-blue-600 text-sm"
            onClick={closeAndClear}
          >
            Create filter
          </button>

          <button
            onClick={() => {
              setAdvancedSearch(form);
              closeSearchPanel();
            }}
            className="bg-blue-600 text-white px-6 py-1.5 text-sm"
          >
            Search
          </button>
        </div>
      </div>
    </>
  );
}
