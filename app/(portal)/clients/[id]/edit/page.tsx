import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ClientForm from "@/components/ClientForm";
import { updateClientRecord } from "@/app/actions";
import type { Client } from "@/lib/types";

export default async function EditClientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("clients").select("*").eq("id", id).single();
  if (!data) notFound();
  const client = data as Client;
  return (
    <>
      <div className="page-head"><div><p className="eyebrow">Edit client</p><h1>{client.business_name}</h1></div></div>
      <ClientForm action={updateClientRecord.bind(null, id)} client={client} cancelHref={`/clients/${id}`} />
    </>
  );
}
