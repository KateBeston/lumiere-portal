import Link from "next/link";
import { CLIENT_STATUSES } from "@/lib/constants";
import type { Client } from "@/lib/types";

export default function ClientForm({
  action,
  client,
  cancelHref,
}: {
  action: (f: FormData) => Promise<void>;
  client?: Client;
  cancelHref: string;
}) {
  const v = (k: keyof Client) => (client?.[k] as string | null) ?? "";
  return (
    <form action={action} className="form card">
      <div className="field full">
        <label htmlFor="business_name">Business name *</label>
        <input id="business_name" name="business_name" required defaultValue={v("business_name")} />
      </div>
      <div className="field"><label htmlFor="contact_name">Contact name</label><input id="contact_name" name="contact_name" defaultValue={v("contact_name")} /></div>
      <div className="field">
        <label htmlFor="status">Status</label>
        <select id="status" name="status" defaultValue={client?.status ?? "prospect"}>
          {CLIENT_STATUSES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
        </select>
      </div>
      <div className="field"><label htmlFor="email">Email</label><input id="email" name="email" type="email" defaultValue={v("email")} /></div>
      <div className="field"><label htmlFor="phone">Phone</label><input id="phone" name="phone" type="tel" defaultValue={v("phone")} /></div>
      <div className="field"><label htmlFor="website">Current website or social</label><input id="website" name="website" defaultValue={v("website")} /></div>
      <div className="field"><label htmlFor="industry">Industry</label><input id="industry" name="industry" placeholder="Pet grooming" defaultValue={v("industry")} /></div>
      <div className="field"><label htmlFor="abn">ABN</label><input id="abn" name="abn" defaultValue={v("abn")} /></div>
      <div className="field"><label htmlFor="source">How they found us</label><input id="source" name="source" placeholder="Instagram outreach" defaultValue={v("source")} /></div>
      <div className="field full"><label htmlFor="address">Address</label><input id="address" name="address" defaultValue={v("address")} /></div>
      <div className="field full"><label htmlFor="notes">Notes</label><textarea id="notes" name="notes" defaultValue={v("notes")} /></div>
      <div className="form-actions">
        <button className="btn" type="submit">Save client</button>
        <Link href={cancelHref} className="btn btn-ghost">Cancel</Link>
      </div>
    </form>
  );
}
