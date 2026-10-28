import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { CLIENT_STATUSES, fmtDate } from "@/lib/constants";
import { StatusBadge } from "@/components/Badges";
import type { Client } from "@/lib/types";

export default async function ClientsPage({ searchParams }: { searchParams: Promise<{ q?: string; status?: string }> }) {
  const { q, status } = await searchParams;
  const supabase = await createClient();
  let query = supabase.from("clients").select("*").order("business_name");
  if (status) query = query.eq("status", status);
  if (q) {
    const term = q.replace(/[%,()]/g, " ").trim();
    query = query.or(`business_name.ilike.%${term}%,contact_name.ilike.%${term}%,email.ilike.%${term}%,industry.ilike.%${term}%`);
  }
  const { data } = await query;
  const clients = (data ?? []) as Client[];

  return (
    <>
      <div className="page-head">
        <div><p className="eyebrow">Records</p><h1>Clients</h1></div>
        <Link href="/clients/new" className="btn">New client</Link>
      </div>
      <form className="toolbar">
        <input name="q" placeholder="Search name, contact, email or industry" defaultValue={q ?? ""} />
        <select name="status" defaultValue={status ?? ""}>
          <option value="">All statuses</option>
          {CLIENT_STATUSES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
        </select>
        <button className="btn btn-ghost" type="submit">Filter</button>
      </form>
      <div className="card">
        {clients.length === 0 ? <p className="empty">No clients found.</p> : (
          <table className="table">
            <thead><tr><th>Business</th><th>Contact</th><th>Industry</th><th>Status</th><th>Added</th></tr></thead>
            <tbody>
              {clients.map((c) => (
                <tr key={c.id} className="rowlink">
                  <td><Link className="strong" href={`/clients/${c.id}`}>{c.business_name}</Link></td>
                  <td>{c.contact_name ?? "—"}<div className="tile-meta">{c.email}</div></td>
                  <td>{c.industry ?? "—"}</td>
                  <td><StatusBadge status={c.status} /></td>
                  <td>{fmtDate(c.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
