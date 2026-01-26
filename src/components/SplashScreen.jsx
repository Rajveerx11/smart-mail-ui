import logo from "../assets/Axon.png";
import { motion } from "framer-motion";
import { LogIn } from "lucide-react";
import { useEffect } from "react";

export default function SplashScreen({ isLoggedIn, onLogin, onFinishSplash }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onFinishSplash(); // notify App to switch step
    }, 2600); // animation duration
    return () => clearTimeout(timer);
  }, [onFinishSplash]);

  return (
    <div className="h-screen bg-white flex items-center justify-center relative overflow-hidden">

      {/* 🔐 LOGIN ICON (only if NOT logged in) */}
      {!isLoggedIn && (
        <motion.button
          onClick={onLogin} // go to login page immediately
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.8, duration: 0.6 }}
          whileHover={{
            scale: 1.15,
            boxShadow: "0 0 20px rgba(79,70,229,0.6)",
          }}
          whileTap={{ scale: 0.95 }}
          className="
            absolute top-6 right-6
            h-11 w-11
            rounded-full
            flex items-center justify-center
            bg-gradient-to-br from-indigo-500 to-blue-600
            text-white
            shadow-lg
            animate-pulse
          "
          title="Login"
        >
          <LogIn size={18} />
        </motion.button>
      )}

      {/* 🌟 CENTER CONTENT */}
      <div className="flex flex-col items-center">

        {/* LOGO */}
        <motion.img
          src={logo}
          alt="Axon"
          className="h-40 w-40 mb-6"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1.3, opacity: 1 }}
          transition={{ duration: 1.1, ease: "easeOut" }}
        />

        {/* 🎬 AXON TITLE – BAHUBALI STYLE */}
        <motion.h1
          className="
            text-6xl font-extrabold tracking-widest
            text-transparent bg-clip-text
            bg-gradient-to-r from-indigo-500 via-blue-600 to-purple-600
            drop-shadow-[0_12px_35px_rgba(79,70,229,0.6)]
          "
          initial={{ opacity: 0, scale: 0.6, rotateX: -90 }}
          animate={{ opacity: 1, scale: 1, rotateX: 0 }}
          transition={{ duration: 1.8, ease: "easeOut" }}
          style={{ transformPerspective: 1200 }}
        >
          AXON
        </motion.h1>

        {/* TAGLINE */}
        <motion.p
          className="text-gray-500 mt-3 tracking-wide"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.6, duration: 0.8 }}
        >
          Smart • Secure • AI Powered
        </motion.p>
      </div>
    </div>
  );
}
