const normalizeCsvValue = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;

export const exportContactsToCsv = (contacts = []) => {
  const rows = [
    ["name", "phone", "email", "address", "category", "notes", "group", "isFavourite"],
    ...contacts.map((contact) => [
      contact.name || "",
      contact.phone || "",
      contact.email || "",
      contact.address || "",
      contact.category || "",
      contact.notes || "",
      contact.group?.name || "",
      contact.isFavourite ? "true" : "false",
    ]),
  ];

  return rows.map((row) => row.map(normalizeCsvValue).join(",")).join("\n");
};

export const parseContactsCsv = (text = "") => {
  const rows = text
    .split(/\r?\n/)
    .filter((row) => row.trim())
    .map((row) => row
      .split(/,(?=(?:[^"]*"[^"]*")*(?![^"]*"))/)
      .map((cell) => cell.replace(/^"|"$/g, "").replace(/""/g, '"')));

  if (!rows.length) return [];

  const [header, ...records] = rows;
  const map = header.map((key) => key.trim().toLowerCase());

  return records
    .filter((record) => record.some((value) => String(value).trim()))
    .map((record) => {
      const item = {};
      map.forEach((key, index) => {
        item[key] = record[index] ?? "";
      });

      return {
        name: (item.name || "").trim(),
        phone: (item.phone || "").trim(),
        email: (item.email || "").trim(),
        address: (item.address || "").trim(),
        category: (item.category || "").trim(),
        notes: (item.notes || "").trim(),
        group: (item.group || "").trim(),
        isFavourite: String(item.isfavourite || item.favorite || "false").toLowerCase() === "true",
      };
    })
    .filter((contact) => contact.name && contact.phone);
};