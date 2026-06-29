"use server";

import { revalidatePath } from "next/cache";
import { clerkClient } from '@clerk/nextjs/server';

const PAYMENTS_URL = process.env.NEXT_PUBLIC_PAYMENTS_URL || 'http://localhost:3000';
const API_KEY = process.env.PAYMENT_API_KEY as string;

const ENDPOINT_URL = `${PAYMENTS_URL}/api/payments/admin/subscriptions`;

export async function obtenerSuscripciones() {
  try {
    const response = await fetch(ENDPOINT_URL, {
      method: 'GET',
      headers: {
        'x-api-key': API_KEY,
        'Content-Type': 'application/json',
      },
      cache: 'no-store'
    });

    if (!response.ok) throw new Error('Fallo al obtener las suscripciones');
    
    const suscripciones = await response.json();
    const vendedoresIdsUnicos = Array.from(new Set(suscripciones.map((s: any) => s.vendedor_id))) as string[];
    const nombresVendedores = new Map<string, string>();

    if (vendedoresIdsUnicos.length > 0) {
      const client = await clerkClient(); 
      const usuariosClerk = await client.users.getUserList({
        userId: vendedoresIdsUnicos,
      });

      usuariosClerk.data.forEach(user => {
        const nombreCompleto = `${user.firstName || ''} ${user.lastName || ''}`.trim();
        nombresVendedores.set(
          user.id, 
          nombreCompleto || user.emailAddresses[0]?.emailAddress || user.id
        );
      });
    }
    
    const suscripcionesConNombres = suscripciones.map((sub: any) => ({
      ...sub,
      vendedor_nombre: nombresVendedores.get(sub.vendedor_id) || sub.vendedor_id
    }));

    return suscripcionesConNombres;
  } catch (error) {
    console.error('Error en Server Action (GET):', error);
    return null;
  }
}

export async function actualizarEstadoSuscripcion(id: string, nuevoEstado: string) {
  try {
    const response = await fetch(ENDPOINT_URL, {
      method: 'PATCH',
      headers: {
        'x-api-key': API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        suscripcion_id: id,
        nuevo_estado: nuevoEstado
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Fallo al actualizar el estado');
    }
    revalidatePath('/admin/pagos'); 
    return { success: true };
  } catch (error) {
    console.error('Error en Server Action (PATCH):', error);
    return { success: false, error: (error as Error).message };
  }
}