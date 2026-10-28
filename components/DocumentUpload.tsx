"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";
import { recordDocument } from "@/app/actions";
import { DOC_KINDS } from "@/lib/constants";

const MAX = 25 * 1024 * 1024;

export default function DocumentUpload({
  clientId,
  projectId,
  projects = [],
}: {
  clientId: string;
  projectId?: string;
  projects?: { id: string; name: string }[];
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMsg(null);
    const f = new FormData(e.currentTarget);
    const file = f.get("file");
    if (!(file instanceof File) || file.size === 0) return setMsg({ ok: false, text: "Choose a file first." });
    if (file.size > MAX) return setMsg({ ok: false, text: "Files must be 25 MB or smaller." });

    setBusy(true);
    try {
      const safe = file.name.replace(/[^\w.\-]+/g, "_");
      const path = `${clientId}/${crypto.randomUUID()}-${safe}`;
      const supabase = createClient();
      const { error } = await supabase.storage.from("documents").upload(path, file, { contentType: file.type || undefined });
      if (error) throw error;
      await recordDocument({
        client_id: clientId,
        project_id: (projectId ?? (f.get("project_id") as string)) || null,
        title: ((f.get("title") as string) || file.name).trim(),
        kind: (f.get("kind") as string) || "other",
        signed_on: (f.get("signed_on") as string) || null,
        storage_path: path,
        file_name: file.name,
        file_size: file.size,
        mime_type: file.type || "application/octet-stream",
      });
      formRef.current?.reset();
      setMsg({ ok: true, text: "Uploaded." });
      router.refresh();
    } catch (err) {
      setMsg({ ok: false, text: err instanceof Error ? err.message : "Upload failed. Try again." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form ref={formRef} className="upload" onSubmit={onSubmit}>
      <div className="field full">
        <label htmlFor="doc-file">File</label>
        <input id="doc-file" name="file" type="file" required />
      </div>
      <div className="field">
        <label htmlFor="doc-title">Title</label>
        <input id="doc-title" name="title" placeholder="Website services agreement" />
      </div>
      <div className="field">
        <label htmlFor="doc-kind">Type</label>
        <select id="doc-kind" name="kind" defaultValue="agreement">
          {DOC_KINDS.map((k) => <option key={k.key} value={k.key}>{k.label}</option>)}
        </select>
      </div>
      <div className="field">
        <label htmlFor="doc-signed">Signed or dated</label>
        <input id="doc-signed" name="signed_on" type="date" />
      </div>
      {!projectId && projects.length > 0 && (
        <div className="field">
          <label htmlFor="doc-project">Project (optional)</label>
          <select id="doc-project" name="project_id" defaultValue="">
            <option value="">None</option>
            {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
      )}
      <div className="full" style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <button className="btn btn-sm" type="submit" disabled={busy}>{busy ? "Uploading…" : "Upload document"}</button>
        {msg && <span className={`msg ${msg.ok ? "msg-ok" : "msg-error"}`}>{msg.text}</span>}
      </div>
    </form>
  );
}
