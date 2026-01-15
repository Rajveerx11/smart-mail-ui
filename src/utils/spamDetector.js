export function isSpam(mail) {
  let score = 0;
  const text = `${mail.subject} ${mail.body}`.toLowerCase();

  if (text.includes("free") || text.includes("win")) score += 3;
  if (text.includes("click here") || text.includes("urgent")) score += 2;
  if (/!!!|\$\$\$/.test(text)) score += 2;

  return score >= 5;
}
