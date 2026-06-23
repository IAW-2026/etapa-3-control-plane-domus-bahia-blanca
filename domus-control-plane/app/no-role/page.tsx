"use client";

import { useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function NoRolePage() {
  const { signOut } = useClerk();
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    router.push("/sign-in");
  }

  return (
    <main
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: "var(--bg-main)" }}
    >
      <div className="text-center max-w-md px-6 animate-fade-up">
        <p
          className="text-8xl font-black select-none leading-none"
          style={{
            color: "var(--primary-muted)",
            fontFamily: "Georgia, serif",
          }}
        >
          403
        </p>

        <div
          className="mx-auto mt-4 mb-5 w-14 h-14 rounded-2xl flex items-center justify-center"
          style={{ backgroundColor: "var(--accent-muted)" }}
        >
          <svg
            width="26"
            height="26"
            viewBox="0 0 24 24"
            fill="none"
            style={{ color: "var(--accent)" }}
          >
            <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" />
            <path
              d="M4 20c0-4 3.6-7 8-7"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M17 14l-3 3 3 3M14 17h6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <h1
          className="text-2xl font-bold"
          style={{ color: "var(--text-main)", fontFamily: "Georgia, serif" }}
        >
          Acceso restringido
        </h1>

        <p className="mt-3 text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
          Tu cuenta está autenticada, pero aún no tiene el rol necesario para
          acceder al panel. Contactá a un administrador o aguardá la aprobación
          de tu cuenta.
        </p>

        <div
          className="mx-auto mt-6 mb-6 w-10 h-0.5 rounded-full"
          style={{ backgroundColor: "var(--border-strong)" }}
        />

        <button
          onClick={handleSignOut}
          className="btn btn-primary"
          style={{ minWidth: "200px" }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path
              d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Cerrar sesión
        </button>

        <p className="mt-4 text-xs" style={{ color: "var(--text-muted)" }}>
          Domus Bahía Blanca · Panel de control
        </p>
      </div>
    </main>
  );
}
