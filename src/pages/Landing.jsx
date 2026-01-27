export default function Landing({ onLogin }) {
  return (
    <div className="h-screen flex flex-col bg-white">
      <div className="flex justify-end p-6">
        <button
          onClick={onLogin}
          className="px-5 py-2 rounded-full bg-indigo-600 text-white shadow"
        >
          Login
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center text-gray-400">
        Welcome to Axon
      </div>
    </div>
  );
}
