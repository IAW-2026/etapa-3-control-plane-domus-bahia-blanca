"use client";

import { useState, useEffect, useRef } from 'react';
import { obtenerSuscripciones, actualizarEstadoSuscripcion } from '@/app/acciones/pagos.acciones';

interface Suscripcion {
  id: string;
  vendedor_id: string;
  estado: 'ACTIVA' | 'PENDIENTE_PAGO' | 'INACTIVA' | 'VENCIDA';
  plan_nombre: string;
  limite_publicaciones: number;
  fecha_inicio: string | null;
  fecha_fin: string | null;
  creado_en: string;
}

function EstadoSelector({ 
  estadoActual, 
  onCambiarEstado, 
  disabled 
}: { 
  estadoActual: string, 
  onCambiarEstado: (nuevo: string) => void, 
  disabled: boolean 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cierra el menú si el usuario hace clic afuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const opciones = [
    { valor: 'ACTIVA', label: 'Marcar ACTIVA' },
    { valor: 'PENDIENTE_PAGO', label: 'Marcar PENDIENTE' },
    { valor: 'INACTIVA', label: 'Marcar INACTIVA' },
    { valor: 'VENCIDA', label: 'Marcar VENCIDA' },
  ];

  const handleSelect = (valor: string) => {
    onCambiarEstado(valor);
    setIsOpen(false);
  };

  const labelActual = opciones.find(o => o.valor === estadoActual)?.label || estadoActual;
  return (
    <div className="relative inline-block w-full max-w-[160px]" ref={dropdownRef}>
      {/* Botón Principal */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full bg-[var(--color-domus-card)] border border-[var(--color-domus-secondary)] text-[var(--color-domus-primary)] font-bold text-xs rounded-xl px-4 py-2 text-left outline-none transition-all shadow-sm flex justify-between items-center ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-[var(--color-domus-primarySoft)] hover:shadow-md'
        }`}
      >
        <span>{labelActual}</span>
        {/* Flecha que gira al abrir */}
        <svg className={`fill-current h-4 w-4 text-[var(--color-domus-primaryMid)] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
          <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
        </svg>
      </button>

      {/* El Menú Desplegable Personalizado */}
      {isOpen && (
        <div className="absolute z-50 mt-2 w-full bg-[var(--color-domus-card)] border border-[var(--color-domus-secondary)] rounded-xl shadow-lg overflow-hidden animate-fade-in">
          <div className="flex flex-col py-1">
            {opciones.map((opcion) => (
              <button
                key={opcion.valor}
                type="button"
                onClick={() => handleSelect(opcion.valor)}
                className={`w-full text-left px-4 py-2.5 text-xs font-bold transition-colors ${
                  estadoActual === opcion.valor
                    ? 'bg-[var(--color-domus-primarySoft)] text-white' // Color activo Domus
                    : 'text-[var(--color-domus-text)] hover:bg-[var(--color-domus-bg)] hover:text-[var(--color-domus-primary)]' // Hover suave
                }`}
              >
                {opcion.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function PagosPanel() {
  const [suscripciones, setSuscripciones] = useState<Suscripcion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setIsLoading(true);
    const data = await obtenerSuscripciones();
    if (data) setSuscripciones(data);
    setIsLoading(false);
  };

  const handleCambioEstado = async (id: string, nuevoEstado: string) => {
    if (updatingId) return; 
    
    if (!window.confirm(`¿Estás seguro de cambiar el estado a ${nuevoEstado}? Esto podría deshabilitar las publicaciones del vendedor.`)) {
      return;
    }

    setUpdatingId(id);
    const resultado = await actualizarEstadoSuscripcion(id, nuevoEstado);
    
    if (resultado.success) {
      setSuscripciones(prev => 
        prev.map(sub => sub.id === id ? { ...sub, estado: nuevoEstado as Suscripcion['estado'] } : sub)
      );
    } else {
      alert(`Error al actualizar: ${resultado.error}`);
    }
    setUpdatingId(null);
  };

  if (isLoading) {
    return (
      <div className="card p-10 text-center text-[var(--color-domus-primaryMid)] animate-pulse">
        Cargando registro de suscripciones...
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-[var(--color-domus-primary)] tracking-tight">
          Gestión de Suscripciones
        </h2>
        <span className="bg-[var(--color-domus-secondary)] text-[var(--color-domus-primary)] px-3 py-1 rounded-full text-xs font-bold shadow-sm">
          {suscripciones.length} Registros Totales
        </span>
      </div>

      <section className="card overflow-hidden">
        <div className="bg-[var(--color-domus-primarySoft)] px-6 py-4 font-bold text-white text-[10px] uppercase tracking-widest flex justify-between items-center">
          <span>Directorio de Planes Activos e Inactivos</span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-xs md:text-sm">
            <thead className="bg-[var(--color-domus-card)] text-[var(--color-domus-primaryMid)] uppercase text-[10px] font-black border-b border-[var(--color-domus-secondary)]">
              <tr>
                <th className="px-6 py-4 text-left">Vendedor ID</th>
                <th className="px-6 py-4 text-left">Plan / Límite</th>
                <th className="px-6 py-4 text-left">Vencimiento</th>
                <th className="px-6 py-4 text-left">Estado Actual</th>
                <th className="px-6 py-4 text-center">Acción (Modificar)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-domus-secondary)]">
              {suscripciones.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-[var(--color-domus-textSoft)]">
                    No se encontraron suscripciones en la base de datos.
                  </td>
                </tr>
              ) : (
                suscripciones.map(sub => (
                  <tr key={sub.id} className="hover:bg-[var(--color-domus-bg)] transition-colors">
                    
                    {/* VENDEDOR */}
                    <td className="px-6 py-4 font-mono text-[10px] text-[var(--color-domus-textSoft)] max-w-[120px] truncate" title={sub.vendedor_id}>
                      {sub.vendedor_id}
                    </td>

                    {/* PLAN */}
                    <td className="px-6 py-4">
                      <div className="font-bold text-[var(--color-domus-primary)]">{sub.plan_nombre}</div>
                      <div className="text-[10px] text-[var(--color-domus-textSoft)] mt-0.5">
                        Cupo: {sub.limite_publicaciones} pubs.
                      </div>
                    </td>

                    {/* VENCIMIENTO */}
                    <td className="px-6 py-4 text-[var(--color-domus-textSoft)] whitespace-nowrap">
                      {sub.fecha_fin ? new Date(sub.fecha_fin).toLocaleDateString() : 'N/A'}
                    </td>

                    {/* ESTADO VISUAL */}
                    <td className="px-6 py-4 font-black">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] uppercase tracking-wider border ${
                        sub.estado === 'ACTIVA' ? 'bg-[#dcfce7] text-[#166534] border-[#bbf7d0]' :
                        sub.estado === 'PENDIENTE_PAGO' ? 'bg-[#ffedd5] text-[#9a3412] border-[#fed7aa]' :
                        sub.estado === 'VENCIDA' ? 'bg-[#fee2e2] text-[#991b1b] border-[#fecaca]' :
                        'bg-[#f3f4f6] text-[#374151] border-[#e5e7eb]' 
                      }`}>
                        {sub.estado.replace('_', ' ')}
                      </span>
                    </td>

                    {/* SELECTOR DE MODIFICACIÓN */}
                    <td className="px-6 py-4 text-center">
                      
                      <EstadoSelector 
                        estadoActual={sub.estado}
                        disabled={updatingId === sub.id}
                        onCambiarEstado={(nuevoEstado) => handleCambioEstado(sub.id, nuevoEstado)}
                      />

                      {updatingId === sub.id && (
                        <div className="text-[9px] text-[var(--color-domus-primaryMid)] mt-1.5 animate-pulse font-bold uppercase tracking-wider">
                          Actualizando...
                        </div>
                      )}
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}