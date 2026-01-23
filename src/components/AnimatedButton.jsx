export default function AnimatedButton({ text, onClick }) {
  return (
    <button
      onClick={onClick}
      className="
        relative overflow-hidden
        px-10 py-3
        rounded-full
        bg-gradient-to-r from-blue-500 to-indigo-600
        text-white font-semibold text-lg
        shadow-lg
        transition-all duration-300
        hover:scale-105 hover:shadow-xl
        active:scale-95
        group
      "
    >
      {/* RIPPLE */}
      <span
        className="
          absolute inset-0
          bg-white/20
          scale-0
          group-active:scale-150
          transition-transform duration-500
          rounded-full
        "
      />

      <span className="relative z-10">{text}</span>
    </button>
  );
}
