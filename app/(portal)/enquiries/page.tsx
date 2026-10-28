import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { convertEnquiry, setEnquiryStatus } from "@/app/actions";
import { fmtDateTime } from "@/lib/constants";
import type { Enquiry } from "@/lib/types";

const TABS = [
  { key: "open", label: "New and contacted" },
  { key: "converted", label: "Converted" },
  { key: "archived", label: "Archived" },
];

export default async function EnquiriesPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab = "open" } = await searchParams;
  const supabase = await createClient();
  let query = supabase.from("enquiries").select("*").order("created_at", { ascending: false });
  query = tab === "open" ? query.in("status", ["new", "contacted"]) : query.eq("status", tab);
  const { data } = await query;
  const items = (data ?? []) as Enquiry[];

  return (
    <>
      <div className="page-head">
        <div><p className="eyebrow">From the website</p><h1>Enquiries</h1><p className="sub">Submissions from the contact form on lumieredigitalco.com.</p></div>
      </div>
      <div className="toolbar">
        {TABS.map((t) => (
          <Link key={t.key} href={`/enquiries?tab=${t.key}`} className={`btn btn-sm ${tab === t.key ? "" : "btn-ghost"}`}>{t.label}</Link>
        ))}
      </div>
      {items.length === 0 ? <div className="card"><p className="empty">Nothing here.</p></div> : items.map((e) => (
        <div key={e.id} className="card">
          <div className="card-head">
            <div>
              <h2>{e.business || e.name}</h2>
              <p className="tile-meta">{fmtDateTime(e.created_at)} · <span className={`badge badge-${e.status === "new" ? "quoted" : e.status === "converted" ? "live" : "lead"}`}>{e.status}</span></p>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {e.status === "converted" && e.client_id ? (
                <Link href={`/clients/${e.client_id}`} className="btn btn-sm btn-ghost">Open client</Link>
              ) : (
                <>
                  <form action={convertEnquiry.bind(null, e.id)}><button className="btn btn-sm" type="submit">Convert to client</button></form>
                  {e.status === "new" && <form action={setEnquiryStatus.bind(null, e.id, "contacted")}><button className="btn btn-sm btn-ghost" type="submit">Mark contacted</button></form>}
                  {e.status !== "archived"
                    ? <form action={setEnquiryStatus.bind(null, e.id, "archived")}><button className="btn btn-sm btn-ghost" type="submit">Archive</button></form>
                    : <form action={setEnquiryStatus.bind(null, e.id, "new")}><button className="btn btn-sm btn-ghost" type="submit">Restore</button></form>}
                </>
              )}
            </div>
          </div>
          <dl className="dl">
            <dt>Name</dt><dd>{e.name}</dd>
            <dt>Email</dt><dd><a href={`mailto:${e.email}`}>{e.email}</a></dd>
            <dt>Phone</dt><dd>{e.phone ? <a href={`tel:${e.phone.replace(/\s/g, "")}`}>{e.phone}</a> : "—"}</dd>
            <dt>Interested in</dt><dd>{e.package ?? "—"}</dd>
          </dl>
          {e.message && <p className="pre" style={{ marginTop: 14 }}>{e.message}</p>}
        </div>
      ))}
    </>
  );
}
