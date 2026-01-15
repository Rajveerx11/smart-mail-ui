import { useMailStore } from "../store/mailStore";

export default function MailItem({ mail }) {
  const setSelectedMail = useMailStore(
    (s) => s.setSelectedMail
  );

  return (
    <div
      onClick={() => setSelectedMail(mail)}
      className="
        px-4 py-3
        border-b
        cursor-pointer
        hover:bg-gray-100
        flex justify-between items-start
      "
    >
      {/* LEFT CONTENT */}
      <div className="flex-1">
        <h4 className="font-medium text-sm text-gray-900">
          {mail.subject}
        </h4>

        <p className="text-xs text-gray-500">
          {mail.from}
        </p>
      </div>

      {/* RIGHT BADGES */}
      <div className="flex gap-2">
        {mail.folder === "Spam" && (
          <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded">
            Spam
          </span>
        )}

        {mail.category === "Promotions" && (
          <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">
            Promo
          </span>
        )}

        {mail.category === "Social" && (
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
            Social
          </span>
        )}

        {mail.category === "Updates" && (
          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
            Updates
          </span>
        )}
      </div>
    </div>
  );
}
