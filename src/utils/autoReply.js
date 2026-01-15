export function generateAutoReply(mail) {
  const subject = mail.subject.toLowerCase();

  if (subject.includes("interview"))
    return "Thank you for the interview invitation. I will attend.";

  if (subject.includes("meeting"))
    return "Meeting confirmed. See you there.";

  if (subject.includes("support"))
    return "Thanks for contacting support. I will review shortly.";

  return "Thank you for reaching out. I will respond soon.";
}
