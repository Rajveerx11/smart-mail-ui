import logo from "../assets/Axon.png";
import { motion } from "framer-motion";
import { LogIn } from "lucide-react";
import { useEffect } from "react";

export default function SplashScreen({ isLoggedIn, onLogin, onFinishSplash }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onFinishSplash();
    }, 2600);

    return () => clearTimeout(timer);
  }, [onFinishSplash]);

  return (
    <div className="h-screen bg-white flex items-center justify-center relative overflow-hidden">

      {/* 🔐 LOGIN BUTTON (ONLY IF NOT LOGGED IN) */}
      {!isLoggedIn && (
        <motion.button
          onClick={onLogin}
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.6, duration: 0.5 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="
            absolute top-6 right-6
            h-10 w-10
            rounded-full
            flex items-center justify-center
            bg-indigo-600 text-white
            shadow-md
          "
        >
          <LogIn size={18} />
        </motion.button>
      )}

      {/* 🌟 CENTER */}
      <div className="flex flex-col items-center">

        {/* LOGO (SMALLER & CLEAN) */}
        <motion.img
          src={logo}
          alt="Axon"
          className="h-24 w-24 mb-4"
          initial={{ scale: 0.4, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
        />

        {/* AXON TEXT */}
        <motion.h1
          className="
            text-4xl font-bold tracking-[0.3em]
            text-transparent bg-clip-text
            bg-gradient-to-r from-indigo-500 to-blue-600
          "
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.6 }}
        >
          AXON
        </motion.h1>

        {/* TAGLINE */}
        <motion.p
          className="text-gray-500 text-sm mt-2 tracking-wide"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
        >
          Smart • Secure • AI Powered
        </motion.p>
      </div>
    </div>
  );
}
