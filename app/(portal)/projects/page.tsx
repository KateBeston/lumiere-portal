import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { STAGES, fmtDate, fmtMoney, packageLabel } from "@/lib/constants";
import type { Project } from "@/lib/types";

export default async function ProjectsBoard() {
  const supabase = await createClient();
  const { data } = await supabase.from("projects").select("*, clients(business_name)").order("updated_at", { ascending: false });
  const projects = (data ?? []) as Project[];

  return (
    <>
      <div className="page-head">
        <div><p className="eyebrow">Pipeline</p><h1>Projects</h1></div>
        <Link href="/projects/new" className="btn">New project</Link>
      </div>
      <div className="board">
        {STAGES.map((s) => {
          const items = projects.filter((p) => p.stage === s.key);
          return (
            <div key={s.key} className="col">
              <div className="col-head"><span>{s.label}</span><span>{items.length}</span></div>
              {items.map((p) => (
                <Link key={p.id} href={`/projects/${p.id}`} className="tile">
                  <p className="tile-title">{p.clients?.business_name}</p>
                  <p className="tile-meta">{p.name}</p>
                  <p className="tile-meta">
                    {packageLabel(p.package)}
                    {p.quote_amount ? ` · ${fmtMoney(p.quote_amount)}` : ""}
                    {p.target_launch ? ` · launch ${fmtDate(p.target_launch)}` : ""}
                  </p>
                </Link>
              ))}
            </div>
          );
        })}
      </div>
    </>
  );
}
