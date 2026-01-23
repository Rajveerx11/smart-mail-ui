import { useState } from "react";
import logo from "../assets/Axon.png";
import { supabase } from "../lib/supabase";
import { Loader2, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    // Prevent default if this is called from a form submit
    if (e) e.preventDefault();

    // Basic Validation
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        // .trim() is critical here to prevent hidden space errors
        email: email.trim(),
        password: password.trim(),
      });

      if (authError) {
        // Handle specific Supabase error messages
        if (authError.message.includes("Email not confirmed")) {
          setError("Your email hasn't been verified yet. Please check your inbox or run the SQL verification command.");
        } else if (authError.message.includes("Invalid login credentials")) {
          setError("Invalid email or password. Please try again.");
        } else {
          setError(authError.message);
        }
        setLoading(false);
      }

      // NOTE: Success is handled automatically by the onAuthStateChange listener in App.jsx

    } catch (err) {
      setError("An unexpected network error occurred. Please check your connection.");
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white w-full max-w-[380px] rounded-2xl shadow-xl p-8 border border-gray-200">

        {/* LOGO */}
        <div className="flex flex-col items-center mb-6">
          <img src={logo} alt="Axon" className="h-14 w-14 mb-2 object-contain" />
          <h2 className="text-2xl font-semibold text-gray-800">Sign in</h2>
          <p className="text-sm text-gray-500 font-medium">to continue to Bodhak AI</p>
        </div>

        {/* ERROR MESSAGE */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200 flex items-center gap-2">
            <AlertCircle size={14} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          {/* EMAIL */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1 ml-1 uppercase tracking-wider">
              Email Address
            </label>
            <input
              type="email"
              autoComplete="email"
              placeholder="name@bodhakai.online"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded-lg px-4 py-2.5 
              focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
            />
          </div>

          {/* PASSWORD */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1 ml-1 uppercase tracking-wider">
              Password
            </label>
            <input
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border rounded-lg px-4 py-2.5 
              focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
            />
          </div>

          {/* LOGIN BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2.5 mt-2
            rounded-lg font-semibold hover:bg-blue-700 disabled:bg-blue-400 flex justify-center items-center gap-2 transition-colors shadow-sm"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : "Sign In"}
          </button>
        </form>

        <p className="text-[10px] text-gray-400 text-center mt-8 uppercase tracking-widest font-bold">
          Enterprise AI Email Environment
        </p>
      </div>
    </div>
  );
}