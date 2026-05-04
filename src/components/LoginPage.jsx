import { useState } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import logo from "../assets/Axon.png";
import { supabase } from "../lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    if (e) e.preventDefault();

    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });

      if (authError) {
        if (authError.message.includes("Email not confirmed")) {
          setError("Your email has not been verified yet. Please check your inbox.");
        } else if (authError.message.includes("Invalid login credentials")) {
          setError("Invalid email or password. Please try again.");
        } else {
          setError(authError.message);
        }
        setLoading(false);
      }
    } catch {
      setError("An unexpected network error occurred. Please check your connection.");
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-[#f5f7fb] p-4">
      <div className="bg-white w-full max-w-[400px] rounded-lg shadow-xl p-8 border border-slate-200">
        <div className="flex flex-col items-center mb-6">
          <img src={logo} alt="Axon" className="h-14 w-14 mb-2 object-contain" />
          <h2 className="text-2xl font-semibold text-slate-950">Sign in</h2>
          <p className="text-sm text-slate-500 font-medium">Continue to Axon Secure Mail</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200 flex items-center gap-2">
            <AlertCircle size={14} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1 ml-1 uppercase tracking-wider">
              Email Address
            </label>
            <input
              type="email"
              autoComplete="email"
              placeholder="name@bodhakai.online"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1 ml-1 uppercase tracking-wider">
              Password
            </label>
            <input
              type="password"
              autoComplete="current-password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2.5 mt-2 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-blue-400 flex justify-center items-center gap-2 transition-colors shadow-sm"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : "Sign In"}
          </button>
        </form>

        <p className="text-[10px] text-slate-400 text-center mt-8 uppercase tracking-widest font-semibold">
          Enterprise AI Email Environment
        </p>
      </div>
    </div>
  );
}
