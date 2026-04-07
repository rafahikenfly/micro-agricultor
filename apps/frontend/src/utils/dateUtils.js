export const toDateTimeLocal = (date) => {
  const pad = (n) => String(n).padStart(2, "0");

  return (
    date.getFullYear() +
    "-" +
    pad(date.getMonth() + 1) +
    "-" +
    pad(date.getDate()) +
    "T" +
    pad(date.getHours()) +
    ":" +
    pad(date.getMinutes())
  );
}

export const ISOToReadableString = (ISOString) => {
  const date = new Date(ISOString);

  const weekday = date.toLocaleDateString("pt-BR", {
    weekday: "short",
  });

  const rest = date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

  const formatted = `${weekday.replace(".", "")}, ${rest}`;

  return formatted
}

export const unixToReadableString = (unixMs) => {
  if (!unixMs) return null;
  const date = new Date(unixMs);

  const weekday = new Intl.DateTimeFormat("pt-BR", {
    weekday: "short",
  }).format(date);

  const dayMonthYear = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  }).format(date);

  const time = new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);

  // Capitaliza a primeira letra
  const weekdayFormatted =
    weekday.charAt(0).toUpperCase() + weekday.slice(1);

  return `${weekdayFormatted}, ${dayMonthYear}, ${time}`;
};

export const firebaseTSToReadableString = (timestamp) => {
  if (!timestamp) return "";

  const date = timestamp.toDate();

  const parts = new Intl.DateTimeFormat("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);

  const get = (type) => parts.find(p => p.type === type)?.value;

  const weekday = get("weekday");
  const weekdayFormatted =
    weekday.charAt(0).toUpperCase() + weekday.slice(1);

  return `${weekdayFormatted}, ${get("day")}/${get("month")}/${get("year")}, ${get("hour")}:${get("minute")}`;
};

export function groupByDay(list = []) {
  const groups = {};

  for (const item of list) {
    const date = new Date(item.contexto?.timestamp || item.timestamp || item.planejamento.vencimento);

    // chave estável (boa pra ordenar)
    const key = date.toISOString().slice(0, 10); // YYYY-MM-DD

    if (!groups[key]) {
      groups[key] = {
        label: date.toLocaleDateString(), // exibição
        items: [],
      };
    }

    groups[key].items.push(item);
  }

  // ordenar dias (mais recente primeiro)
  return Object.entries(groups)
    .sort(([a], [b]) => new Date(b) - new Date(a))
    .map(([key, value]) => ({
      key,
      label: value.label,
      items: value.items.sort(
        (a, b) =>
          (b.contexto?.timestamp || b.timestamp || b.planejamento.vencimento) - (a.contexto?.timestamp || a.timestamp || a.planejamento.vencimento) // ordenar dentro do dia
      ),
    }));
}

export function inicioDoDia(unix) {
  const d = new Date(unix);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export function mesmaData(a, b) {
  const da = new Date(a);
  return (
    da.getFullYear() === b.getFullYear() &&
    da.getMonth() === b.getMonth() &&
    da.getDate() === b.getDate()
  );
}

export function adicionarDias(unix, days) {
  return unix + days * 24 * 60 * 60 * 1000;
}