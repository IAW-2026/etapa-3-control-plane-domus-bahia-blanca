const API_URL = process.env.FEEDBACK_API_URL;
const API_KEY = process.env.FEEDBACK_CONTROL_PANEL_API_KEY;

export async function getFeedbackData() {
  const res = await fetch(`${API_URL}/api/admin/reviews`, {
    headers: { "X-API-Key": API_KEY! },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Error obteniendo datos de feedback");
  }

  return res.json();
}

export async function deleteReview(id: string) {
  const res = await fetch(`${API_URL}/api/admin/reviews/${id}`, {
    method: "DELETE",
    headers: { "X-API-Key": API_KEY! },
  });

  return res.json();
}

export async function deleteResponse(id: string) {
  const res = await fetch(`${API_URL}/api/admin/responses/${id}`, {
    method: "DELETE",
    headers: { "X-API-Key": API_KEY! },
  });

  return res.json();
}