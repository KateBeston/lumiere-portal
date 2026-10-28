import { Fragment } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { deleteClientRecord } from "@/app/actions";
import { fmtDate, fmtMoney, packageLabel } from "@/lib/constants";
import { StageBadge, StatusBadge } from "@/components/Badges";
import Timeline from "@/components/Timeline";
import DocumentUpload from "@/components/DocumentUpload";
import DocumentTable from "@/components/DocumentTable";
import ConfirmButton from "@/components/ConfirmButton";
import type { Activity, Client, DocumentRow, Project } from "@/lib/types";

export default async function ClientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const [{ data: c }, { data: projects }, { data: docs }, { data: activity }] = await Promise.all([
    supabase.from("clients").select("*").eq("id", id).single(),
    supabase.from("projects").select("*").eq("client_id", id).order("created_at", { ascending: false }),
    supabase.from("documents").select("*, projects(name)").eq("client_id", id).order("created_at", { ascending: false }),
    supabase.from("activity").select("*").eq("client_id", id).order("created_at", { ascending: false }),
  ]);
  if (!c) notFound();
  const client = c as Client;
  const proj = (projects ?? []) as Project[];

  const contact: [string, React.ReactNode][] = [
    ["Contact", client.contact_name],
    ["Email", client.email && <a href={`mailto:${client.email}`}>{client.email}</a>],
    ["Phone", client.phone && <a href={`tel:${client.phone.replace(/\s/g, "")}`}>{client.phone}</a>],
    ["Website or social", client.website],
    ["Address", client.address],
    ["ABN", client.abn],
    ["Industry", client.industry],
    ["Found us via", client.source],
    ["Added", fmtDate(client.created_at)],
  ];

  return (
    <>
      <div className="page-head">
        <div>
          <p className="eyebrow"><Link href="/clients">Clients</Link></p>
          <h1>{client.business_name}</h1>
          <p className="sub"><StatusBadge status={client.status} /></p>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <Link href={`/clients/${id}/edit`} className="btn btn-ghost">Edit</Link>
          <Link href={`/projects/new?client=${id}`} className="btn">New project</Link>
        </div>
      </div>

      <div className="grid-2">
        <div>
          <div className="card">
            <div className="card-head"><h2>Details</h2></div>
            <dl className="dl">
              {contact.map(([k, v]) => (<Fragment key={k}><dt>{k}</dt><dd>{v || "—"}</dd></Fragment>))}
            </dl>
            {client.notes && <><h3 style={{ marginTop: 18, marginBottom: 6 }}>Notes</h3><p className="pre">{client.notes}</p></>}
          </div>

          <div className="card">
            <div className="card-head"><h2>Projects</h2></div>
            {proj.length === 0 ? <p className="empty">No projects yet.</p> : (
              <table className="table">
                <thead><tr><th>Project</th><th>Package</th><th>Quote</th><th>Stage</th></tr></thead>
                <tbody>
                  {proj.map((p) => (
                    <tr key={p.id} className="rowlink">
                      <td><Link className="strong" href={`/projects/${p.id}`}>{p.name}</Link></td>
                      <td>{packageLabel(p.package)}</td>
                      <td>{fmtMoney(p.quote_amount)}</td>
                      <td><StageBadge stage={p.stage} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="card">
            <div className="card-head"><h2>Agreements and documents</h2></div>
            <DocumentUpload clientId={id} projects={proj.map((p) => ({ id: p.id, name: p.name }))} />
            <DocumentTable docs={(docs ?? []) as DocumentRow[]} />
          </div>

          <div style={{ marginTop: 18 }}>
            <ConfirmButton
              action={deleteClientRecord.bind(null, id)}
              message={`Delete ${client.business_name}, including all projects, documents and history? This can't be undone.`}
              label="Delete client"
              className="btn btn-danger btn-sm"
            />
          </div>
        </div>

        <div className="card">
          <div className="card-head"><h2>History</h2></div>
          <Timeline items={(activity ?? []) as Activity[]} clientId={id} />
        </div>
      </div>
    </>
  );
}
