export const stripHtml = (html) => {
  if (typeof html !== 'string') return '';
  let text = html
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#34;/g, '"');
  return text.replace(/<[^>]*>/g, '');
};

export const formatUpdatedDate = (dateInput) => {
  if (!dateInput) return "";
  const d = new Date(dateInput);
  return isNaN(d.getTime())
    ? ""
    : d.toLocaleString("en-IN", { month: "short", year: "numeric" });
};

export const formatINR = (amount) => {
  if (!amount && amount !== 0) return null;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export const DIFFICULTY_OPTIONS = ["Beginner", "Intermediate", "Advanced", "Expert"];