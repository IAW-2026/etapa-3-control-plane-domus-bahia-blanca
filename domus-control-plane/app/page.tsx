"use client";

import { useUser } from "@clerk/nextjs";
import Link from "next/link";

export default function HomePage() {
  const { isSignedIn, isLoaded } = useUser();

  if (!isLoaded) return null;

  if (isSignedIn) {
    return (
      <main className="min-h-screen bg-domus-bg flex flex-col items-center justify-center p-8">
        <div className="text-center max-w-lg">
          <h1 className="text-6xl font-bold text-domus-primary mb-4">Domus</h1>
          <p className="text-xl text-domus-textSoft mb-8">Bienvenido al Panel de Control</p>
          <Link href="/dashboard" className="btn btn-primary px-8 py-3 text-base">
            Ir al panel
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-domus-bg flex flex-col items-center justify-center p-8">
      <div className="text-center max-w-lg">
        <h1 className="text-6xl font-bold text-domus-primary mb-4">Domus</h1>
        <p className="text-xl text-domus-textSoft mb-8">Panel de Control — Administración centralizada</p>
        <div className="flex gap-4 justify-center">
          <Link href="/sign-in" className="btn btn-primary px-8 py-3 text-base">
            Iniciar sesión
          </Link>
          <Link href="/sign-up" className="btn btn-secondary px-8 py-3 text-base">
            Registrarse
          </Link>
        </div>
      </div>
    </main>
  );
}
