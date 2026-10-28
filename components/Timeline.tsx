import Link from "next/link";
import { addNote } from "@/app/actions";
import { fmtDateTime } from "@/lib/constants";
import type { Activity } from "@/lib/types";

export default function Timeline({
  items,
  clientId,
  projectId,
  showClient = false,
}: {
  items: Activity[];
  clientId?: string;
  projectId?: string;
  showClient?: boolean;
}) {
  return (
    <div>
      {clientId && (
        <form action={addNote} className="note-form">
          <input type="hidden" name="client_id" value={clientId} />
          {projectId && <input type="hidden" name="project_id" value={projectId} />}
          <textarea name="body" placeholder="Add a note: a call, a decision, a change request…" required />
          <div><button className="btn btn-sm" type="submit">Add note</button></div>
        </form>
      )}
      {items.length === 0 ? (
        <p className="empty">No history yet.</p>
      ) : (
        <div className="timeline">
          {items.map((a) => (
            <div key={a.id} className={`tl-item k-${a.kind}`}>
              <p className="tl-time">
                {fmtDateTime(a.created_at)}
                {showClient && a.clients && (
                  <> · <Link href={`/clients/${a.client_id}`}>{a.clients.business_name}</Link></>
                )}
              </p>
              <p className="tl-body">{a.body}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
