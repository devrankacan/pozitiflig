import type { Metadata } from "next";
import { login } from "./actions";

export const metadata: Metadata = {
  title: "Admin Girişi | Pozitif Lig",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="mx-auto flex max-w-sm flex-col justify-center px-4 py-24 sm:px-6">
      <span className="text-xs font-semibold uppercase tracking-widest text-accent">
        Yönetim
      </span>
      <h1 className="mt-1 text-2xl font-bold">Admin Girişi</h1>

      <form action={login} className="pl-card mt-6 flex flex-col gap-4 p-6">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className="text-sm font-medium">
            Parola
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoFocus
            className="rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-accent"
          />
        </div>

        {error && <p className="text-sm text-red-500">Parola yanlış, tekrar dene.</p>}

        <button
          type="submit"
          className="mt-2 rounded-full bg-gradient-to-r from-accent to-accent-dark px-4 py-2 text-sm font-semibold text-background transition-opacity hover:opacity-90"
        >
          Giriş Yap
        </button>
      </form>
    </div>
  );
}
