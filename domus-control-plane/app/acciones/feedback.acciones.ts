"use server";

import { getFeedbackData, deleteReview, deleteResponse } from "@/app/servicios/feedbackApi";

export async function getFeedbackDashboardData() {
  try {
    const result = await getFeedbackData();
    return { success: true, data: result.data };
  } catch (error) {
    return { success: false, data: null };
  }
}

export async function deleteReviewAction(id: string) {
  return deleteReview(id);
}

export async function deleteResponseAction(id: string) {
  return deleteResponse(id);
}