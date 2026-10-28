import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { deleteProject, updateProject } from "@/app/actions";
import { fmtMoney } from "@/lib/constants";
import ProjectForm from "@/components/ProjectForm";
import StageSelect from "@/components/StageSelect";
import Timeline from "@/components/Timeline";
import DocumentUpload from "@/components/DocumentUpload";
import DocumentTable from "@/components/DocumentTable";
import ConfirmButton from "@/components/ConfirmButton";
import type { Activity, DocumentRow, Project } from "@/lib/types";

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const [{ data: p }, { data: docs }, { data: activity }] = await Promise.all([
    supabase.from("projects").select("*, clients(business_name)").eq("id", id).single(),
    supabase.from("documents").select("*").eq("project_id", id).order("created_at", { ascending: false }),
    supabase.from("activity").select("*").eq("project_id", id).order("created_at", { ascending: false }),
  ]);
  if (!p) notFound();
  const project = p as Project;
  const balance = project.quote_amount != null ? Number(project.quote_amount) - Number(project.deposit_amount ?? 0) : null;

  return (
    <>
      <div className="page-head">
        <div>
          <p className="eyebrow"><Link href={`/clients/${project.client_id}`}>{project.clients?.business_name}</Link></p>
          <h1>{project.name}</h1>
          <p className="sub">
            Quote {fmtMoney(project.quote_amount)} · Deposit {project.deposit_paid_on ? "paid" : "unpaid"} · Balance{" "}
            {project.balance_paid_on ? "paid" : balance != null ? `${fmtMoney(balance)} outstanding` : "—"}
          </p>
        </div>
        <div style={{ minWidth: 220 }}><StageSelect id={id} stage={project.stage} /></div>
      </div>

      <div className="grid-2">
        <div>
          <ProjectForm action={updateProject.bind(null, id)} project={project} cancelHref={`/clients/${project.client_id}`} />
          <div className="card">
            <div className="card-head"><h2>Documents</h2></div>
            <DocumentUpload clientId={project.client_id} projectId={id} />
            <DocumentTable docs={(docs ?? []) as DocumentRow[]} />
          </div>
          <div style={{ marginTop: 18 }}>
            <ConfirmButton
              action={deleteProject.bind(null, id, project.client_id)}
              message={`Delete the project "${project.name}"? Its documents stay on the client record.`}
              label="Delete project"
              className="btn btn-danger btn-sm"
            />
          </div>
        </div>
        <div className="card">
          <div className="card-head"><h2>History</h2></div>
          <Timeline items={(activity ?? []) as Activity[]} clientId={project.client_id} projectId={id} />
        </div>
      </div>
    </>
  );
}
