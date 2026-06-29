import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-domus-bg">
      <div className="text-center max-w-md px-4">
        <p className="text-8xl font-black select-none leading-none" style={{ color: "var(--primary-muted)" }}>
          404
        </p>
        <h1 className="text-2xl font-bold text-domus-text mt-4">
          Página no encontrada
        </h1>
        <p className="text-domus-textSoft mt-2">
          La página que buscás no existe o fue movida.
        </p>
        <Link
          href="/dashboard"
          className="inline-block mt-6 px-6 py-3 btn btn-primary font-medium transition-colors"
        >
          Volver al panel
        </Link>
      </div>
    </main>
  );
}
