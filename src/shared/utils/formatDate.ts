export default function formatDate(
  date: string | Date | undefined,
  endDate?: string | Date | null,
  precision: string = "day",
): string {
  if (!date) return "";

  const d = new Date(date);
  if (isNaN(d.getTime())) return "";

  const getOpts = (p: string): Intl.DateTimeFormatOptions => {
    if (p === "time")
      return {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      };
    if (p === "day")
      return { day: "2-digit", month: "2-digit", year: "numeric" };
    if (p === "month") return { month: "long", year: "numeric" };
    if (p === "year") return { year: "numeric" };
    return { day: "2-digit", month: "2-digit", year: "numeric" };
  };

  const formatter = new Intl.DateTimeFormat("ru-RU", getOpts(precision));
  let result = formatter.format(d);

  if (endDate) {
    const ed = new Date(endDate);
    if (!isNaN(ed.getTime())) {
      result += " — " + formatter.format(ed);
    }
  }

  if (precision === "month") {
    result = result.charAt(0).toUpperCase() + result.slice(1);
  }
  return result;
}
