import { createClient } from "@/lib/supabase/server";
import { DOC_KINDS } from "@/lib/constants";
import DocumentTable from "@/components/DocumentTable";
import type { DocumentRow } from "@/lib/types";

export default async function DocumentsPage({ searchParams }: { searchParams: Promise<{ q?: string; kind?: string }> }) {
  const { q, kind } = await searchParams;
  const supabase = await createClient();
  let query = supabase.from("documents").select("*, clients(business_name), projects(name)").order("created_at", { ascending: false });
  if (kind) query = query.eq("kind", kind);
  if (q) query = query.ilike("title", `%${q.replace(/[%,()]/g, " ").trim()}%`);
  const { data } = await query;

  return (
    <>
      <div className="page-head"><div><p className="eyebrow">Records</p><h1>Documents</h1><p className="sub">Agreements, quotes, invoices and briefs across all clients. Add documents from a client or project page.</p></div></div>
      <form className="toolbar">
        <input name="q" placeholder="Search document titles" defaultValue={q ?? ""} />
        <select name="kind" defaultValue={kind ?? ""}>
          <option value="">All types</option>
          {DOC_KINDS.map((k) => <option key={k.key} value={k.key}>{k.label}</option>)}
        </select>
        <button className="btn btn-ghost" type="submit">Filter</button>
      </form>
      <div className="card"><DocumentTable docs={(data ?? []) as DocumentRow[]} showClient /></div>
    </>
  );
}
