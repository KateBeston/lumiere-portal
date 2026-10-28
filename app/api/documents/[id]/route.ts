import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Opens a private document through a short-lived signed link. Row level security decides access.
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: doc } = await supabase.from("documents").select("storage_path, file_name").eq("id", id).single();
  if (!doc) return new NextResponse("Not found", { status: 404 });

  const { data, error } = await supabase.storage.from("documents").createSignedUrl(doc.storage_path, 60);
  if (error || !data) return new NextResponse("Could not open the document", { status: 500 });
  return NextResponse.redirect(data.signedUrl);
}
