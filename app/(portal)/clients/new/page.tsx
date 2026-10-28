import ClientForm from "@/components/ClientForm";
import { createClientRecord } from "@/app/actions";

export default function NewClientPage() {
  return (
    <>
      <div className="page-head"><div><p className="eyebrow">Clients</p><h1>New client</h1></div></div>
      <ClientForm action={createClientRecord} cancelHref="/clients" />
    </>
  );
}
