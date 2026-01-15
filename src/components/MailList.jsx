import MailItem from "./MailItem";
import { useMailStore } from "../store/mailStore";

export default function MailList() {
  const getFilteredMails = useMailStore((s) => s.getFilteredMails);
  const mails = getFilteredMails(); // 👈 CALL HERE

  return (
    <div className="w-[380px] border-r overflow-y-auto bg-white">
      {mails.length ? (
        mails.map((m) => <MailItem key={m.id} mail={m} />)
      ) : (
        <div className="p-6 text-gray-500">No mails</div>
      )}
    </div>
  );
}
