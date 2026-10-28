import { signIn } from "@/app/actions";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return (
    <main className="login">
      <div className="login-card">
        <img src="/lumiere-logo-reversed.svg" alt="Lumière Digital Co" />
        <form action={signIn}>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" autoComplete="email" required />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input id="password" name="password" type="password" autoComplete="current-password" required />
          </div>
          {error && <p className="msg msg-error">That email and password don't match. Try again.</p>}
          <button className="btn" type="submit">Sign in</button>
        </form>
      </div>
    </main>
  );
}
