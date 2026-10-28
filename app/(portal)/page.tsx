import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ACTIVE_STAGES, fmtDate, fmtMoney, packageLabel } from "@/lib/constants";
import { StageBadge } from "@/components/Badges";
import Timeline from "@/components/Timeline";
import type { Activity, Project } from "@/lib/types";

export default async function Dashboard() {
  const supabase = await createClient();
  const [{ data: projects }, { count: clientCount }, { data: activity }] = await Promise.all([
    supabase.from("projects").select("*, clients(business_name)").order("updated_at", { ascending: false }),
    supabase.from("clients").select("id", { count: "exact", head: true }),
    supabase.from("activity").select("*, clients(business_name)").order("created_at", { ascending: false }).limit(12),
  ]);

  const all = (projects ?? []) as Project[];
  const active = all.filter((p) => (ACTIVE_STAGES as string[]).includes(p.stage));
  const pipeline = all.filter((p) => ["lead", "quoted"].includes(p.stage)).reduce((s, p) => s + Number(p.quote_amount ?? 0), 0);
  const monthly = all.filter((p) => p.stage === "care_plan").reduce((s, p) => s + Number(p.care_plan_monthly ?? 0), 0);
  const upcoming = all
    .filter((p) => p.target_launch && !p.launched_on && !["closed", "live", "care_plan"].includes(p.stage))
    .sort((a, b) => (a.target_launch! < b.target_launch! ? -1 : 1))
    .slice(0, 6);

  return (
    <>
      <div className="page-head">
        <div>
          <p className="eyebrow">Lumière Digital Co</p>
          <h1>Dashboard</h1>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <Link href="/clients/new" className="btn btn-ghost">New client</Link>
          <Link href="/projects/new" className="btn">New project</Link>
        </div>
      </div>

      <div className="stats">
        <div className="stat"><p className="stat-label">Clients</p><p className="stat-value">{clientCount ?? 0}</p></div>
        <div className="stat"><p className="stat-label">Active projects</p><p className="stat-value">{active.length}</p></div>
        <div className="stat"><p className="stat-label">Quoted pipeline</p><p className="stat-value">{fmtMoney(pipeline)}</p></div>
        <div className="stat"><p className="stat-label">Care plans / month</p><p className="stat-value">{fmtMoney(monthly)}</p></div>
      </div>

      <div className="grid-2">
        <div>
          <div className="card">
            <div className="card-head"><h2>Active projects</h2><Link href="/projects" className="linkbtn">View board</Link></div>
            {active.length === 0 ? <p className="empty">No active projects yet.</p> : (
              <table className="table">
                <thead><tr><th>Project</th><th>Client</th><th>Package</th><th>Stage</th></tr></thead>
                <tbody>
                  {active.map((p) => (
                    <tr key={p.id} className="rowlink">
                      <td><Link className="strong" href={`/projects/${p.id}`}>{p.name}</Link></td>
                      <td><Link href={`/clients/${p.client_id}`}>{p.clients?.business_name}</Link></td>
                      <td>{packageLabel(p.package)}</td>
                      <td><StageBadge stage={p.stage} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          <div className="card">
            <div className="card-head"><h2>Upcoming launches</h2></div>
            {upcoming.length === 0 ? <p className="empty">No launch dates set.</p> : (
              <table className="table">
                <tbody>
                  {upcoming.map((p) => (
                    <tr key={p.id} className="rowlink">
                      <td><Link className="strong" href={`/projects/${p.id}`}>{p.name}</Link><div className="tile-meta">{p.clients?.business_name}</div></td>
                      <td style={{ textAlign: "right" }}>{fmtDate(p.target_launch)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
        <div className="card">
          <div className="card-head"><h2>Recent activity</h2></div>
          <Timeline items={(activity ?? []) as Activity[]} showClient />
        </div>
      </div>
    </>
  );
}
