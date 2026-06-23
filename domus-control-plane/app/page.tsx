"use client";

import { useState } from "react";

import ClientePanel from "@/app/componentes/dashboard/ClientePanel";
import VendedorPanel from "@/app/componentes/dashboard/VendedorPanel";
import AgentePanel from "@/app/componentes/dashboard/AgentePanel";
import PropiedadesPanel from "@/app/componentes/dashboard/PropiedadesPanel";
import PagosPanel from "@/app/componentes/dashboard/PagosPanel";
import VisitasPanel from "@/app/componentes/dashboard/VisitasPanel";
import ReseniasPanel from "@/app/componentes/dashboard/ReseniasPanel";

const tabs = [
  "Cliente",
  "Vendedor",
  "Agente",
  "Propiedades",
  "Pagos",
  "Visitas",
  "Reseñas",
] as const;

export default function DashboardPage() {
  const [activeTab, setActiveTab] =
    useState<(typeof tabs)[number]>("Cliente");

  return (
    <main className="min-h-screen bg-domus-bg p-8">

      <div className="max-w-7xl mx-auto">

        <header className="mb-10">
          <h1 className="text-5xl font-bold text-domus-primary">
            Panel Global
          </h1>

          <p className="text-domus-textSoft mt-2">
            Administración centralizada del ecosistema Domus.
          </p>
        </header>

        {/* TABS */}

        <div className="bg-domus-card border border-domus-secondary rounded-3xl p-2 flex gap-2 mb-8 shadow-sm">

          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`
                px-6 py-3 rounded-2xl font-semibold capitalize transition-all
                ${
                  activeTab === tab
                    ? "bg-domus-primary text-white shadow"
                    : "text-domus-text hover:bg-domus-secondary"
                }
              `}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* CONTENT */}

        <section className="bg-domus-card border border-domus-secondary rounded-3xl p-8 shadow-sm min-h-[600px]">

          {activeTab === "Cliente" && <ClientePanel />}

          {activeTab === "Vendedor" && <VendedorPanel />}

          {activeTab === "Agente" && <AgentePanel />}

          {activeTab === "Propiedades" && <PropiedadesPanel />}

          {activeTab === "Pagos" && <PagosPanel />}

          {activeTab === "Visitas" && <VisitasPanel />}

          {activeTab === "Reseñas" && <ReseniasPanel />}

        </section>

      </div>

    </main>
  );
}