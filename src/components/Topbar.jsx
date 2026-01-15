import {
  Menu,
  Search,
  SlidersHorizontal,
  X,
  Clock,
} from "lucide-react";
import { useMailStore } from "../store/mailStore";
import { useEffect, useRef, useState } from "react";

export default function Topbar() {
  const {
    searchText,
    setSearchText,
    clearSearch,
    toggleSidebar,
    openSearchPanel,
    searchHistory,
    addSearchHistory,
    user,
    isProfileOpen,
    toggleProfile,
    closeProfile,
    openAddAccount,
    openSignOut,
    openManageAccount, // ✅ ADDED
  } = useMailStore();

  const inputRef = useRef(null);
  const profileBoxRef = useRef(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "/" && document.activeElement !== inputRef.current) {
        e.preventDefault();
        inputRef.current.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (
        profileBoxRef.current &&
        !profileBoxRef.current.contains(e.target)
      ) {
        closeProfile();
      }
    };
    if (isProfileOpen) {
      document.addEventListener("mousedown", handler);
    }
    return () =>
      document.removeEventListener("mousedown", handler);
  }, [isProfileOpen, closeProfile]);

  return (
    <div className="h-16 flex items-center justify-between px-4 bg-white border-b">

      {/* LEFT */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="hover:bg-gray-100 p-2 rounded-full"
        >
          <Menu size={22} />
        </button>

        <div className="flex items-center gap-2">
          <img
            src="https://ssl.gstatic.com/ui/v1/icons/mail/rfr/gmail.ico"
            className="w-6 h-6"
          />
          <span className="text-xl font-medium">Gmail</span>
        </div>

        {/* SEARCH */}
        <div className="relative w-[480px]">
          <div className="flex items-center gap-3 bg-gray-100 px-4 py-2 rounded-full">
            <Search size={18} />

            <input
              ref={inputRef}
              value={searchText}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() =>
                setTimeout(() => setShowSuggestions(false), 150)
              }
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search mail"
              className="bg-transparent outline-none flex-1 text-sm"
            />

            {searchText && (
              <button
                onMouseDown={(e) => {
                  e.preventDefault();
                  clearSearch();
                }}
              >
                <X size={16} />
              </button>
            )}

            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={openSearchPanel}
            >
              <SlidersHorizontal size={18} />
            </button>
          </div>

          {showSuggestions && searchHistory.length > 0 && (
            <div className="absolute top-12 left-0 right-0 bg-white shadow-xl rounded-xl z-50">
              {searchHistory.map((item) => (
                <div
                  key={item}
                  onMouseDown={() => {
                    setSearchText(item);
                    addSearchHistory(item);
                  }}
                  className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 cursor-pointer"
                >
                  <Clock size={16} />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT PROFILE */}
      <div className="relative" ref={profileBoxRef}>
        <button
          onClick={toggleProfile}
          className="w-10 h-10 rounded-full bg-blue-600 text-white
          flex items-center justify-center font-semibold shadow-md"
        >
          {user.name.charAt(0)}
        </button>

        {isProfileOpen && (
          <div className="absolute right-0 mt-3 w-72 bg-[#eef3fd]
          rounded-2xl shadow-2xl p-4 z-50">

            <div className="flex justify-between items-start">
              <span className="text-sm text-gray-600">
                {user.email}
              </span>
              <button onClick={closeProfile}>
                <X size={16} />
              </button>
            </div>

            <div className="flex flex-col items-center mt-4">
              <div className="w-20 h-20 rounded-full bg-blue-600
              text-white flex items-center justify-center text-3xl">
                {user.name.charAt(0)}
              </div>

              <h2 className="mt-3 text-lg font-medium">
                Hi, {user.name}!
              </h2>

              <button
                onClick={openManageAccount}   // ✅ FIX
                className="mt-3 border border-blue-600
                text-blue-600 px-4 py-1 rounded-full text-sm"
              >
                Manage your Google Account
              </button>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-2">
              <button
                onClick={openAddAccount}
                className="bg-white rounded-full py-2 shadow text-sm"
              >
                Add account
              </button>
              <button
                onClick={openSignOut}
                className="bg-white rounded-full py-2 shadow text-sm"
              >
                Sign out
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
