import {
  Menu,
  Search,
  X,
  Clock,
  RefreshCw,
} from "lucide-react";
import { useMailStore } from "../store/mailStore";
import { useEffect, useRef, useState } from "react";
import logo from "../assets/Axon.png";
import ProfileMenu from "./profileMenu";

export default function Topbar() {
  const {
    searchText,
    setSearchText,
    clearSearch,
    toggleSidebar,
    searchHistory,
    addSearchHistory,
    user,
    isProfileOpen,
    toggleProfile,
    closeProfile,
    // New Logic Added
    isRefreshing,
    forceRefresh,
  } = useMailStore();

  const inputRef = useRef(null);
  const profileBoxRef = useRef(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showHoverProfile, setShowHoverProfile] = useState(false);

  // Derive Display Name and Initial safely from Supabase user object
  const displayName = user?.user_metadata?.name || user?.email || "User";
  const userInitial = displayName.charAt(0).toUpperCase();

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
    return () => document.removeEventListener("mousedown", handler);
  }, [isProfileOpen, closeProfile]);

  return (
    <div className="h-16 flex items-center justify-between px-4 bg-white border-b sticky top-0 z-30">
      {/* LEFT: LOGO & SIDEBAR TOGGLE */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="hover:bg-gray-100 p-2 rounded-full transition-colors"
        >
          <Menu size={22} className="text-gray-700" />
        </button>

        <div className="flex items-center gap-2">
          <img src={logo} alt="Axon" className="h-7 w-7" />
          <span className="text-xl font-bold tracking-tight text-gray-900 hidden sm:inline">Axon</span>
        </div>
      </div>

      {/* CENTER: SEARCH & REFRESH */}
      <div className="flex items-center gap-3 flex-1 max-w-2xl ml-4">
        <div className="relative flex-1">
          <div className="flex items-center gap-3 bg-gray-100 px-4 py-2.5 rounded-2xl focus-within:bg-white focus-within:shadow-md border border-transparent focus-within:border-indigo-100 transition-all">
            <Search size={18} className="text-gray-400" />
            <input
              ref={inputRef}
              value={searchText}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search mail"
              className="bg-transparent outline-none flex-1 text-sm text-gray-700 placeholder:text-gray-400"
            />
            {searchText && (
              <button onClick={clearSearch} className="text-gray-400 hover:text-indigo-600 transition-colors">
                <X size={16} />
              </button>
            )}
            {/* REMOVED: SlidersHorizontal (Filters) for a cleaner look */}
          </div>

          {/* SEARCH HISTORY DROPDOWN */}
          {showSuggestions && searchHistory?.length > 0 && (
            <div className="absolute top-12 left-0 right-0 bg-white shadow-2xl rounded-2xl z-50 py-3 border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
              <p className="px-4 pb-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Recent Searches</p>
              {searchHistory.map((item) => (
                <div
                  key={item}
                  onMouseDown={() => {
                    setSearchText(item);
                    addSearchHistory(item);
                  }}
                  className="flex items-center gap-3 px-4 py-2 hover:bg-indigo-50 cursor-pointer transition-colors"
                >
                  <Clock size={14} className="text-gray-400" />
                  <span className="text-sm text-gray-600">{item}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* NEW: REFRESH BUTTON */}
        <button
          onClick={forceRefresh}
          disabled={isRefreshing}
          title="Refresh Mailbox"
          className={`p-2.5 rounded-xl transition-all duration-300 flex items-center justify-center
            ${isRefreshing
              ? "bg-indigo-50 text-indigo-600"
              : "text-gray-500 hover:bg-gray-100 hover:text-indigo-600"
            }`}
        >
          <RefreshCw
            size={20}
            className={`${isRefreshing ? "animate-spin" : ""}`}
          />
        </button>
      </div>

      {/* RIGHT: PROFILE SECTION */}
      <div
        className="relative ml-4"
        ref={profileBoxRef}
        onMouseEnter={() => setShowHoverProfile(true)}
        onMouseLeave={() => setShowHoverProfile(false)}
      >
        <button
          onClick={toggleProfile}
          className="w-10 h-10 rounded-full bg-indigo-600 text-white
          flex items-center justify-center font-bold shadow-md hover:scale-105 active:scale-95 transition-all"
        >
          {userInitial}
        </button>

        {/* HOVER TOOLTIP */}
        {showHoverProfile && !isProfileOpen && user && (
          <div className="absolute right-0 mt-3 w-64
            bg-slate-900 text-white text-xs
            rounded-xl px-4 py-3 shadow-2xl
            pointer-events-none z-50 animate-in fade-in slide-in-from-top-1">
            <p className="font-bold text-indigo-400 uppercase tracking-tighter mb-1">Active Account</p>
            <p className="font-medium text-sm truncate">{displayName}</p>
            <p className="opacity-60 truncate">{user?.email}</p>
          </div>
        )}

        {isProfileOpen && <ProfileMenu />}
      </div>
    </div>
  );
}