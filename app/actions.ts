"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// ---------- helpers ----------
const str = (f: FormData, k: string) => {
  const v = f.get(k);
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t === "" ? null : t;
};
const num = (f: FormData, k: string) => {
  const v = str(f, k);
  if (v === null) return null;
  const n = Number(v.replace(/[$,\s]/g, ""));
  return Number.isFinite(n) ? n : null;
};
const fail = (msg: string): never => {
  throw new Error(msg);
};

// ---------- auth ----------
export async function signIn(formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: str(formData, "email") ?? "",
    password: (formData.get("password") as string) ?? "",
  });
  if (error) redirect("/login?error=1");
  redirect("/");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

// ---------- clients ----------
function clientFields(f: FormData) {
  return {
    business_name: str(f, "business_name") ?? fail("Business name is required"),
    contact_name: str(f, "contact_name"),
    email: str(f, "email"),
    phone: str(f, "phone"),
    website: str(f, "website"),
    address: str(f, "address"),
    abn: str(f, "abn"),
    industry: str(f, "industry"),
    source: str(f, "source"),
    status: str(f, "status") ?? "prospect",
    notes: str(f, "notes"),
  };
}

export async function createClientRecord(formData: FormData) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("clients").insert(clientFields(formData)).select("id").single();
  if (error) fail(error.message);
  revalidatePath("/clients");
  redirect(`/clients/${data!.id}`);
}

export async function updateClientRecord(id: string, formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.from("clients").update(clientFields(formData)).eq("id", id);
  if (error) fail(error.message);
  revalidatePath(`/clients/${id}`);
  redirect(`/clients/${id}`);
}

export async function deleteClientRecord(id: string) {
  const supabase = await createClient();
  const { data: docs } = await supabase.from("documents").select("storage_path").eq("client_id", id);
  if (docs && docs.length) await supabase.storage.from("documents").remove(docs.map((d) => d.storage_path));
  const { error } = await supabase.from("clients").delete().eq("id", id);
  if (error) fail(error.message);
  revalidatePath("/clients");
  redirect("/clients");
}

// ---------- projects ----------
function projectFields(f: FormData) {
  return {
    name: str(f, "name") ?? fail("Project name is required"),
    package: str(f, "package"),
    stage: str(f, "stage") ?? "lead",
    quote_amount: num(f, "quote_amount"),
    deposit_amount: num(f, "deposit_amount"),
    deposit_paid_on: str(f, "deposit_paid_on"),
    balance_paid_on: str(f, "balance_paid_on"),
    start_date: str(f, "start_date"),
    target_launch: str(f, "target_launch"),
    launched_on: str(f, "launched_on"),
    domain: str(f, "domain"),
    hosting: str(f, "hosting"),
    booking_platform: str(f, "booking_platform"),
    care_plan_monthly: num(f, "care_plan_monthly"),
    notes: str(f, "notes"),
  };
}

export async function createProject(formData: FormData) {
  const supabase = await createClient();
  const client_id = str(formData, "client_id") ?? fail("Choose a client");
  const { data, error } = await supabase
    .from("projects")
    .insert({ client_id, ...projectFields(formData) })
    .select("id")
    .single();
  if (error) fail(error.message);
  revalidatePath("/projects");
  redirect(`/projects/${data!.id}`);
}

export async function updateProject(id: string, formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.from("projects").update(projectFields(formData)).eq("id", id);
  if (error) fail(error.message);
  revalidatePath(`/projects/${id}`);
  revalidatePath("/projects");
  redirect(`/projects/${id}`);
}

export async function setProjectStage(id: string, stage: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("projects").update({ stage }).eq("id", id);
  if (error) fail(error.message);
  revalidatePath("/projects");
  revalidatePath(`/projects/${id}`);
  revalidatePath("/");
}

export async function deleteProject(id: string, clientId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) fail(error.message);
  revalidatePath("/projects");
  redirect(`/clients/${clientId}`);
}

// ---------- documents ----------
// The file itself is uploaded from the browser straight to private storage; this records it.
export async function recordDocument(input: {
  client_id: string;
  project_id: string | null;
  title: string;
  kind: string;
  signed_on: string | null;
  storage_path: string;
  file_name: string;
  file_size: number;
  mime_type: string;
}) {
  const supabase = await createClient();
  if (!input.storage_path.startsWith(`${input.client_id}/`)) fail("Invalid file path");
  const { error } = await supabase.from("documents").insert(input);
  if (error) {
    await supabase.storage.from("documents").remove([input.storage_path]);
    fail(error.message);
  }
  revalidatePath(`/clients/${input.client_id}`);
  if (input.project_id) revalidatePath(`/projects/${input.project_id}`);
  revalidatePath("/documents");
}

export async function deleteDocument(id: string) {
  const supabase = await createClient();
  const { data: doc } = await supabase.from("documents").select("storage_path, client_id, project_id").eq("id", id).single();
  if (!doc) fail("Document not found");
  await supabase.storage.from("documents").remove([doc!.storage_path]);
  const { error } = await supabase.from("documents").delete().eq("id", id);
  if (error) fail(error.message);
  revalidatePath(`/clients/${doc!.client_id}`);
  if (doc!.project_id) revalidatePath(`/projects/${doc!.project_id}`);
  revalidatePath("/documents");
}

// ---------- notes ----------
export async function addNote(formData: FormData) {
  const supabase = await createClient();
  const client_id = str(formData, "client_id") ?? fail("Missing client");
  const project_id = str(formData, "project_id");
  const body = str(formData, "body");
  if (!body) return;
  const { error } = await supabase.from("activity").insert({ client_id, project_id, kind: "note", body });
  if (error) fail(error.message);
  revalidatePath(`/clients/${client_id}`);
  if (project_id) revalidatePath(`/projects/${project_id}`);
  revalidatePath("/");
}
