import {
  Menu,
  Search,
  X,
  Clock,
  RefreshCw,
  Command,
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
  const userPhoto = user?.user_metadata?.photo;

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

  const submitSearch = (e) => {
    if (e.key === "Enter" && searchText.trim()) {
      addSearchHistory(searchText.trim());
      inputRef.current?.blur();
    }
  };

  return (
    <header className="h-16 flex items-center justify-between gap-4 px-4 sm:px-6 bg-white border-b border-slate-200 sticky top-0 z-30">
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={toggleSidebar}
          className="hover:bg-slate-100 p-2 rounded-lg transition-colors"
          aria-label="Toggle sidebar"
        >
          <Menu size={21} className="text-slate-600" />
        </button>

        <div className="flex items-center gap-2.5 min-w-0">
          <img src={logo} alt="Axon" className="h-8 w-8 object-contain" />
          <div className="hidden sm:block leading-tight">
            <span className="block text-lg font-semibold tracking-tight text-slate-950">Axon</span>
            <span className="block text-[11px] font-medium text-slate-500">Secure Mail</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-1 max-w-3xl">
        <div className="relative flex-1">
          <div className="flex h-11 items-center gap-3 bg-slate-100 px-4 rounded-lg border border-transparent focus-within:bg-white focus-within:border-blue-200 focus-within:shadow-sm transition-all">
            <Search size={18} className="text-slate-400 shrink-0" />
            <input
              ref={inputRef}
              value={searchText}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              onChange={(e) => setSearchText(e.target.value)}
              onKeyDown={submitSearch}
              placeholder="Search mail"
              className="bg-transparent outline-none flex-1 min-w-0 text-sm text-slate-700 placeholder:text-slate-400"
            />
            <div className="hidden md:flex items-center gap-1 text-[11px] font-medium text-slate-400">
              <Command size={12} />
              K
            </div>
            {searchText && (
              <button
                onClick={clearSearch}
                className="text-slate-400 hover:text-blue-600 transition-colors"
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {showSuggestions && searchHistory?.length > 0 && (
            <div className="absolute top-12 left-0 right-0 bg-white shadow-xl rounded-lg z-50 py-2 border border-slate-200 overflow-hidden search-suggestions">
              <p className="px-4 pb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Recent searches</p>
              {searchHistory.map((item) => (
                <div
                  key={item}
                  onMouseDown={() => {
                    setSearchText(item);
                    addSearchHistory(item);
                  }}
                  className="flex items-center gap-3 px-4 py-2 hover:bg-blue-50 cursor-pointer transition-colors"
                >
                  <Clock size={14} className="text-slate-400" />
                  <span className="text-sm text-slate-600 truncate">{item}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={forceRefresh}
          disabled={isRefreshing}
          title="Refresh mailbox"
          className={`h-11 w-11 rounded-lg transition-all duration-300 flex items-center justify-center border border-transparent
            ${isRefreshing
              ? "bg-blue-50 text-blue-600 border-blue-100"
              : "text-slate-500 hover:bg-slate-100 hover:text-blue-600"
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
          className="w-10 h-10 rounded-lg bg-slate-950 text-white flex items-center justify-center font-semibold shadow-sm hover:bg-slate-800 transition-colors overflow-hidden"
          aria-label="Open profile menu"
        >
          {userPhoto ? (
            <img src={userPhoto} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            userInitial
          )}
        </button>

        {/* HOVER TOOLTIP */}
        {showHoverProfile && !isProfileOpen && user && (
          <div className="absolute right-0 mt-3 w-64 bg-slate-950 text-white text-xs rounded-lg px-4 py-3 shadow-xl pointer-events-none z-50">
            <p className="font-semibold text-blue-300 uppercase tracking-wider mb-1">Active account</p>
            <p className="font-medium text-sm truncate">{displayName}</p>
            <p className="opacity-70 truncate">{user?.email}</p>
          </div>
        )}

        {isProfileOpen && <ProfileMenu />}
      </div>
    </header>
  );
}
