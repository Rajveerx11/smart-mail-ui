import logo from "../assets/Axon.png";

export default function LoginPage({ onLogin }) {
  return (
    <div className="h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white w-[380px] rounded-2xl shadow-xl p-8">

        {/* LOGO */}
        <div className="flex flex-col items-center mb-6">
          <img src={logo} alt="Axon" className="h-14 w-14 mb-2" />
          <h2 className="text-2xl font-semibold">Sign in</h2>
          <p className="text-sm text-gray-500">to continue to Axon</p>
        </div>

        {/* EMAIL */}
        <input
          type="email"
          placeholder="Email"
          className="w-full border rounded-lg px-4 py-2 mb-3
          focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* PASSWORD */}
        <input
          type="password"
          placeholder="Password"
          className="w-full border rounded-lg px-4 py-2 mb-4
          focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* LOGIN BUTTON */}
        <button
          onClick={onLogin}
          className="w-full bg-blue-600 text-white py-2
          rounded-lg font-semibold hover:bg-blue-700"
        >
          Sign In
        </button>

        {/* EXTRA */}
        <p className="text-xs text-gray-500 text-center mt-4">
          This is a demo login screen
        </p>
      </div>
    </div>
  );
}
