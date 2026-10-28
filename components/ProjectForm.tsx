import Link from "next/link";
import { PACKAGES, STAGES } from "@/lib/constants";
import type { Project } from "@/lib/types";

export default function ProjectForm({
  action,
  project,
  clients,
  defaultClientId,
  cancelHref,
}: {
  action: (f: FormData) => Promise<void>;
  project?: Project;
  clients?: { id: string; business_name: string }[];
  defaultClientId?: string;
  cancelHref: string;
}) {
  const v = (k: keyof Project) => {
    const x = project?.[k];
    return x === null || x === undefined ? "" : String(x);
  };
  return (
    <form action={action} className="form card">
      {clients && (
        <div className="field full">
          <label htmlFor="client_id">Client *</label>
          <select id="client_id" name="client_id" required defaultValue={defaultClientId ?? ""}>
            <option value="" disabled>Choose a client</option>
            {clients.map((c) => <option key={c.id} value={c.id}>{c.business_name}</option>)}
          </select>
        </div>
      )}
      <div className="field full"><label htmlFor="name">Project name *</label><input id="name" name="name" required placeholder="Website + online booking" defaultValue={v("name")} /></div>
      <div className="field">
        <label htmlFor="package">Package</label>
        <select id="package" name="package" defaultValue={v("package")}>
          <option value="">Not set</option>
          {PACKAGES.map((p) => <option key={p.key} value={p.key}>{p.label}</option>)}
        </select>
      </div>
      <div className="field">
        <label htmlFor="stage">Stage</label>
        <select id="stage" name="stage" defaultValue={project?.stage ?? "lead"}>
          {STAGES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
        </select>
      </div>

      <p className="form-section">Money</p>
      <div className="field"><label htmlFor="quote_amount">Quote (AUD)</label><input id="quote_amount" name="quote_amount" inputMode="decimal" defaultValue={v("quote_amount")} /></div>
      <div className="field"><label htmlFor="deposit_amount">Deposit (AUD)</label><input id="deposit_amount" name="deposit_amount" inputMode="decimal" defaultValue={v("deposit_amount")} /></div>
      <div className="field"><label htmlFor="deposit_paid_on">Deposit paid on</label><input id="deposit_paid_on" name="deposit_paid_on" type="date" defaultValue={v("deposit_paid_on")} /></div>
      <div className="field"><label htmlFor="balance_paid_on">Balance paid on</label><input id="balance_paid_on" name="balance_paid_on" type="date" defaultValue={v("balance_paid_on")} /></div>
      <div className="field"><label htmlFor="care_plan_monthly">Care plan (AUD per month)</label><input id="care_plan_monthly" name="care_plan_monthly" inputMode="decimal" defaultValue={v("care_plan_monthly")} /></div>

      <p className="form-section">Dates</p>
      <div className="field"><label htmlFor="start_date">Start date</label><input id="start_date" name="start_date" type="date" defaultValue={v("start_date")} /></div>
      <div className="field"><label htmlFor="target_launch">Target launch</label><input id="target_launch" name="target_launch" type="date" defaultValue={v("target_launch")} /></div>
      <div className="field"><label htmlFor="launched_on">Launched on</label><input id="launched_on" name="launched_on" type="date" defaultValue={v("launched_on")} /></div>

      <p className="form-section">Set-up</p>
      <div className="field"><label htmlFor="domain">Domain</label><input id="domain" name="domain" placeholder="example.com.au" defaultValue={v("domain")} /></div>
      <div className="field"><label htmlFor="hosting">Hosting</label><input id="hosting" name="hosting" placeholder="Cloudflare Pages (client account)" defaultValue={v("hosting")} /></div>
      <div className="field"><label htmlFor="booking_platform">Booking platform</label><input id="booking_platform" name="booking_platform" placeholder="Square Appointments" defaultValue={v("booking_platform")} /></div>
      <div className="field full"><label htmlFor="notes">Notes</label><textarea id="notes" name="notes" defaultValue={v("notes")} /></div>

      <div className="form-actions">
        <button className="btn" type="submit">Save project</button>
        <Link href={cancelHref} className="btn btn-ghost">Cancel</Link>
      </div>
    </form>
  );
}
