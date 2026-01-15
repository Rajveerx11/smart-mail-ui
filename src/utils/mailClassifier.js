export function classifyMail(mail) {
  const from = mail.from.toLowerCase();
  const subject = mail.subject.toLowerCase();
  const body = mail.body.toLowerCase();
  const text = `${from} ${subject} ${body}`;

  // 🚨 SPAM DETECTION
  const spamWords = [
    "win money",
    "free offer",
    "lottery",
    "click here",
    "earn fast",
    "crypto",
  ];
  if (spamWords.some((w) => text.includes(w))) {
    return { folder: "Spam", category: "" };
  }

  // 📢 PROMOTIONS
  if (
    from.includes("amazon") ||
    from.includes("flipkart") ||
    text.includes("sale") ||
    text.includes("offer")
  ) {
    return { folder: "Inbox", category: "Promotions" };
  }

  // 👥 SOCIAL
  if (
    from.includes("linkedin") ||
    from.includes("facebook") ||
    from.includes("twitter")
  ) {
    return { folder: "Inbox", category: "Social" };
  }

  // 🔔 UPDATES
  if (
    from.includes("github") ||
    from.includes("noreply") ||
    text.includes("login")
  ) {
    return { folder: "Inbox", category: "Updates" };
  }

  // 📩 DEFAULT
  return { folder: "Inbox", category: "Primary" };
}
