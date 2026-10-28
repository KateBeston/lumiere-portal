export const STAGES = [
  { key: "lead", label: "Lead" },
  { key: "quoted", label: "Quoted" },
  { key: "deposit_paid", label: "Deposit paid" },
  { key: "building", label: "Building" },
  { key: "review", label: "Client review" },
  { key: "live", label: "Live" },
  { key: "care_plan", label: "Care plan" },
  { key: "closed", label: "Closed" },
] as const;
export type Stage = (typeof STAGES)[number]["key"];
export const stageLabel = (s: string) => STAGES.find((x) => x.key === s)?.label ?? s;
export const ACTIVE_STAGES: Stage[] = ["lead", "quoted", "deposit_paid", "building", "review"];

export const PACKAGES = [
  { key: "essential", label: "Essential" },
  { key: "bookings", label: "Bookings" },
  { key: "custom", label: "Custom" },
  { key: "care_plan_only", label: "Care plan only" },
] as const;
export const packageLabel = (p: string | null) => PACKAGES.find((x) => x.key === p)?.label ?? "—";

export const CLIENT_STATUSES = [
  { key: "prospect", label: "Prospect" },
  { key: "active", label: "Active" },
  { key: "past", label: "Past" },
] as const;
export const clientStatusLabel = (s: string) => CLIENT_STATUSES.find((x) => x.key === s)?.label ?? s;

export const DOC_KINDS = [
  { key: "agreement", label: "Agreement" },
  { key: "quote", label: "Quote" },
  { key: "invoice", label: "Invoice" },
  { key: "brief", label: "Brief or content" },
  { key: "other", label: "Other" },
] as const;
export const docKindLabel = (k: string) => DOC_KINDS.find((x) => x.key === k)?.label ?? k;

const money = new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD" });
export const fmtMoney = (n: number | string | null | undefined) =>
  n === null || n === undefined || n === "" ? "—" : money.format(Number(n));

export const fmtDate = (d: string | null | undefined) =>
  d ? new Date(d.length === 10 ? d + "T00:00:00" : d).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" }) : "—";

export const fmtDateTime = (d: string) =>
  new Date(d).toLocaleString("en-AU", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" });

export const fmtSize = (b: number | null) =>
  !b ? "" : b < 1024 * 1024 ? `${Math.round(b / 1024)} KB` : `${(b / 1024 / 1024).toFixed(1)} MB`;
