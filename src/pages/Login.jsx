import { useAuthStore } from "../store/authStore";

export default function Login() {
  const login = useAuthStore((s) => s.login);

  const handleLogin = () => {
    login({
      name: "Marco",
      email: "marco@gmail.com",
    });
  };

  return (
    <div className="h-screen flex items-center justify-center">
      <button
        onClick={handleLogin}
        className="px-6 py-3 bg-indigo-600 text-white rounded-lg"
      >
        Login
      </button>
    </div>
  );
}
