"use client";

import { getAllPropiedadesParaMapaAction } from "@/app/acciones/propiedades.acciones";
import { useEffect, useState } from "react";
import { Search, Trash2, MessageSquareOff } from "lucide-react";
import {
  getFeedbackDashboardData,
  deleteReviewAction,
  deleteResponseAction,
} from "@/app/acciones/feedback.acciones";

export default function ReseniasPanel() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [propertyMap, setPropertyMap] = useState<Record<string, string>>({});
  
  useEffect(() => {
  async function load() {
    const [feedbackResult, propertyMap] = await Promise.all([
      getFeedbackDashboardData(),
      getAllPropiedadesParaMapaAction(),
    ]);

    if (feedbackResult.success && feedbackResult.data) {
      setStats(feedbackResult.data.stats);
      setReviews(feedbackResult.data.reviews);
    }

    setPropertyMap(propertyMap);
    setLoading(false);
  }
  load();
}, []);
  async function handleDeleteReview(id: string) {
    if (!confirm("¿Eliminar esta reseña?")) return;
    const result = await deleteReviewAction(id);
    if (result.success) {
      setReviews((prev) => prev.filter((r) => r.id !== id));
    }
  }

  async function handleDeleteResponse(reviewId: string, responseId: string) {
    if (!confirm("¿Eliminar esta respuesta?")) return;
    const result = await deleteResponseAction(responseId);
    if (result.success) {
      setReviews((prev) =>
        prev.map((r) => (r.id === reviewId ? { ...r, response: null } : r))
      );
    }
  }

  const filtered = reviews.filter(
    (r) =>
      (r.authorName ?? "").toLowerCase().includes(search.toLowerCase()) ||
      r.targetId.toLowerCase().includes(search.toLowerCase()) ||
      r.content.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return <p className="text-domus-textSoft">Cargando...</p>;
  }

  return (
    <div className="space-y-8">

      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-domus-primary">
            Feedback Control
          </h2>
          <p className="text-domus-textSoft mt-2">
            Moderación global de reseñas.
          </p>
        </div>

        <div className="relative w-full lg:w-96">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-domus-textSoft" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar usuario, propiedad o comentario..."
            className="input-base pl-10 py-3"
          />
        </div>
      </div>

      {/* QUICK STATS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-5">
          <p className="text-domus-textSoft text-sm">Total reseñas</p>
          <h3 className="text-3xl font-bold text-domus-primary mt-2">
            {stats?.totalReviews ?? 0}
          </h3>
        </div>

        <div className="card p-5">
          <p className="text-domus-textSoft text-sm">Rating promedio</p>
          <h3 className="text-3xl font-bold text-domus-terracota mt-2">
            {stats?.averageRating?.toFixed(1) ?? "0.0"}
          </h3>
        </div>

        <div className="card p-5">
          <p className="text-domus-textSoft text-sm">Con respuesta</p>
          <h3 className="text-3xl font-bold text-domus-primary mt-2">
            {stats?.reviewsWithResponse ?? 0}
          </h3>
        </div>

        <div className="card p-5">
          <p className="text-domus-textSoft text-sm">Sin respuesta</p>
          <h3 className="text-3xl font-bold text-domus-terracota mt-2">
            {stats?.reviewsWithoutResponse ?? 0}
          </h3>
        </div>
      </div>

      {/* REVIEWS TABLE */}
      <div className="card overflow-hidden">
        <div className="px-6 py-5 border-b border-domus-secondary">
          <h3 className="font-bold text-xl text-domus-primary">
            Moderación de reseñas
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-domus-secondary bg-domus-secondary/30">
                <th className="text-left p-4">Usuario</th>
                <th className="text-left p-4">Propiedad</th>
                <th className="text-left p-4">Rating</th>
                <th className="text-left p-4">Comentario</th>
                <th className="text-left p-4">Respuesta</th>
                <th className="text-left p-4">Fecha</th>
                <th className="text-left p-4">Acciones</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((review) => (
                <tr key={review.id} className="border-b border-domus-secondary hover:bg-domus-secondary/20">
                  <td className="p-4 font-medium">
                    {review.authorName ?? "Anónimo"}
                  </td>

                  <td className="p-4">{propertyMap[review.targetId] ?? review.targetId}</td>

                  <td className="p-4">⭐ {review.rating}</td>

                  <td className="p-4 max-w-sm truncate">{review.content}</td>

                  <td className="p-4 max-w-xs truncate text-domus-textSoft">
                    {review.response ? review.response.content : "—"}
                  </td>

                  <td className="p-4 text-domus-textSoft">
                    {new Date(review.createdAt).toLocaleDateString("es-AR")}
                  </td>

                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <button
                        className="btn btn-danger px-3 py-2"
                        title="Eliminar reseña"
                        onClick={() => handleDeleteReview(review.id)}
                      >
                        <Trash2 size={16} />
                      </button>

                      {review.response && (
                        <button
                          className="px-3 py-2 rounded-xl border border-domus-secondary text-domus-textSoft hover:bg-orange-50 hover:border-orange-300 hover:text-orange-600 transition"
                          title="Eliminar respuesta del vendedor"
                          onClick={() => handleDeleteResponse(review.id, review.response.id)}
                        >
                          <MessageSquareOff size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <p className="text-center text-domus-textSoft py-12">
              No hay reseñas para mostrar.
            </p>
          )}
        </div>
      </div>

    </div>
  );
}