import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/actions";
import NavLink from "@/components/NavLink";

export const dynamic = "force-dynamic";

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: isStaff } = await supabase.rpc("is_staff");
  if (!isStaff) {
    return (
      <main className="login">
        <div className="login-card">
          <img src="/lumiere-logo-reversed.svg" alt="Lumière Digital Co" />
          <p>This account doesn't have access to the portal.</p>
          <form action={signOut} style={{ marginTop: 20 }}>
            <button className="btn btn-ghost" type="submit">Sign out</button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <div className="shell">
      <aside className="sidebar">
        <a href="/" className="sidebar-logo"><img src="/lumiere-wordmark-reversed.svg" alt="Lumière" /></a>
        <nav>
          <NavLink href="/">Dashboard</NavLink>
          <NavLink href="/enquiries">Enquiries</NavLink>
          <NavLink href="/clients">Clients</NavLink>
          <NavLink href="/projects">Projects</NavLink>
          <NavLink href="/documents">Documents</NavLink>
        </nav>
        <div className="sidebar-foot">
          <span>{user.email}</span>
          <form action={signOut}><button className="linkbtn" type="submit">Sign out</button></form>
        </div>
      </aside>
      <main className="main">{children}</main>
    </div>
  );
}
