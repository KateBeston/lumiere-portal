import Link from "next/link";
import { deleteDocument } from "@/app/actions";
import { docKindLabel, fmtDate, fmtSize } from "@/lib/constants";
import type { DocumentRow } from "@/lib/types";
import ConfirmButton from "./ConfirmButton";

export default function DocumentTable({ docs, showClient = false }: { docs: DocumentRow[]; showClient?: boolean }) {
  if (docs.length === 0) return <p className="empty">No documents yet.</p>;
  return (
    <table className="table">
      <thead>
        <tr>
          <th>Title</th>
          <th>Type</th>
          {showClient && <th>Client</th>}
          <th>Signed or dated</th>
          <th>Added</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {docs.map((d) => (
          <tr key={d.id}>
            <td>
              <a className="strong" href={`/api/documents/${d.id}`} target="_blank" rel="noopener">{d.title}</a>
              <div className="tile-meta">{d.file_name} {fmtSize(d.file_size)}{d.projects ? ` · ${d.projects.name}` : ""}</div>
            </td>
            <td><span className="badge">{docKindLabel(d.kind)}</span></td>
            {showClient && <td><Link href={`/clients/${d.client_id}`}>{d.clients?.business_name}</Link></td>}
            <td>{fmtDate(d.signed_on)}</td>
            <td>{fmtDate(d.created_at)}</td>
            <td style={{ textAlign: "right" }}>
              <ConfirmButton action={deleteDocument.bind(null, d.id)} message={`Delete "${d.title}"? This can't be undone.`} label="Delete" />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
