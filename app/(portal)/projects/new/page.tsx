import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ProjectForm from "@/components/ProjectForm";
import { createProject } from "@/app/actions";

export default async function NewProjectPage({ searchParams }: { searchParams: Promise<{ client?: string }> }) {
  const { client } = await searchParams;
  const supabase = await createClient();
  const { data } = await supabase.from("clients").select("id, business_name").order("business_name");
  const clients = data ?? [];

  return (
    <>
      <div className="page-head"><div><p className="eyebrow">Projects</p><h1>New project</h1></div></div>
      {clients.length === 0 ? (
        <div className="card"><p>Add a client first. <Link href="/clients/new" className="linkbtn">New client</Link></p></div>
      ) : (
        <ProjectForm action={createProject} clients={clients} defaultClientId={client} cancelHref={client ? `/clients/${client}` : "/projects"} />
      )}
    </>
  );
}
