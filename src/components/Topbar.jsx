import {
  Menu,
  Search,
  SlidersHorizontal,
  X,
  Clock,
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
    openSearchPanel,
    searchHistory,
    addSearchHistory,
    user,
    isProfileOpen,
    toggleProfile,
    closeProfile,
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
    <div className="h-16 flex items-center justify-between px-4 bg-white border-b">
      {/* LEFT */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="hover:bg-gray-100 p-2 rounded-full transition-colors"
        >
          <Menu size={22} />
        </button>

        <div className="flex items-center gap-2">
          <img src={logo} alt="Axon" className="h-7 w-7" />
          <span className="text-xl font-semibold hidden sm:inline">Axon</span>
        </div>

        {/* SEARCH */}
        <div className="relative w-[300px] md:w-[480px]">
          <div className="flex items-center gap-3 bg-gray-100 px-4 py-2 rounded-full focus-within:bg-white focus-within:shadow-sm border border-transparent focus-within:border-gray-200 transition-all">
            <Search size={18} className="text-gray-500" />
            <input
              ref={inputRef}
              value={searchText}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search mail"
              className="bg-transparent outline-none flex-1 text-sm"
            />
            {searchText && (
              <button onClick={clearSearch} className="text-gray-500 hover:text-black">
                <X size={16} />
              </button>
            )}
            <button onClick={openSearchPanel} className="text-gray-500 hover:text-black">
              <SlidersHorizontal size={18} />
            </button>
          </div>

          {showSuggestions && searchHistory.length > 0 && (
            <div className="absolute top-12 left-0 right-0 bg-white shadow-xl rounded-xl z-50 py-2 border">
              {searchHistory.map((item) => (
                <div
                  key={item}
                  onMouseDown={() => {
                    setSearchText(item);
                    addSearchHistory(item);
                  }}
                  className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 cursor-pointer"
                >
                  <Clock size={16} className="text-gray-400" />
                  <span className="text-sm">{item}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT PROFILE */}
      <div
        className="relative"
        ref={profileBoxRef}
        onMouseEnter={() => setShowHoverProfile(true)}
        onMouseLeave={() => setShowHoverProfile(false)}
      >
        <button
          onClick={toggleProfile}
          className="w-10 h-10 rounded-full bg-blue-600 text-white
          flex items-center justify-center font-semibold shadow-md hover:opacity-90 transition-opacity"
        >
          {userInitial}
        </button>

        {/* HOVER TOOLTIP */}
        {showHoverProfile && !isProfileOpen && user && (
          <div className="absolute right-0 mt-2 w-60
            bg-gray-800 text-white text-sm
            rounded-lg px-4 py-3 shadow-xl
            pointer-events-none z-50">
            <p className="font-medium">Account Info</p>
            <p className="opacity-90">{displayName}</p>
            <p className="text-xs opacity-70">{user?.email}</p>
          </div>
        )}

        {isProfileOpen && <ProfileMenu />}
      </div>
    </div>
  );
}