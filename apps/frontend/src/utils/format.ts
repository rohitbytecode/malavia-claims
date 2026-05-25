const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export const formatCurrency = (value?: number) =>
  currencyFormatter.format(value ?? 0);

const dateTimeFormatter = new Intl.DateTimeFormat("en-IN", {
  dateStyle: "medium",
  timeStyle: "short",
});

export const formatDateTime = (value?: string) =>
  value ? dateTimeFormatter.format(new Date(value)) : "—";

const dateFormatter = new Intl.DateTimeFormat("en-IN", {
  dateStyle: "medium",
});

export const formatDate = (value?: string) =>
  value ? dateFormatter.format(new Date(value)) : "—";
export const labelize = (value?: string) =>
  value
    ? value
        .replaceAll("_", " ")
        .toLowerCase()
        .replace(/\b\w/g, (m) => m.toUpperCase())
    : "—";
export const ageInDays = (value: string) =>
  Math.max(
    0,
    Math.floor((Date.now() - new Date(value).getTime()) / 86_400_000)
  );
export const idOf = (value: string | { _id: string } | undefined): string =>
  typeof value === "string" ? value : (value?._id ?? "");
export const nameOf = (
  value:
    | string
    | { fullName?: string; name?: string; code?: string; _id: string }
    | undefined
): string =>
  typeof value === "string"
    ? value
    : (value?.fullName ?? value?.name ?? value?.code ?? "—");
