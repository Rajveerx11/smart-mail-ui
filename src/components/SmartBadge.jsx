export default function SmartBadge({ label }) {
  const colors = {
    Work: "bg-blue-500",
    Spam: "bg-red-500",
    Safe: "bg-green-500",
  };

  return (
    <span
      className={`text-xs px-2 py-1 rounded-full text-white ${colors[label]}`}
    >
      {label}
    </span>
  );
}
