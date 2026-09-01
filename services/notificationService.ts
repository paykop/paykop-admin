// src/services/notificationService.ts
import { apiRequest } from "./apiService";
import {
  notificationListResponseSchema,
  notificationActionResponseSchema,
  NotificationListResponse,
  NotificationActionResponse,
} from "../schemas/notificationSchema";

/**
 * Fetch in-app notifications for authenticated admin user (GET /api/v1/notifications)
 */
export async function fetchNotifications(
  token: string,
  page = 1,
  limit = 20
): Promise<NotificationListResponse> {
  return apiRequest("/api/v1/notifications", notificationListResponseSchema, {
    params: {
      page: page.toString(),
      limit: limit.toString(),
    },
  });
}

/**
 * Mark a single in-app notification as read (PATCH /api/v1/notifications/:id/read)
 */
export async function markNotificationAsRead(token: string, id: number): Promise<NotificationActionResponse> {
  return apiRequest(`/api/v1/notifications/${id}/read`, notificationActionResponseSchema, {
    method: "PATCH",
  });
}

/**
 * Mark all in-app notifications as read (PATCH /api/v1/notifications/read-all)
 */
export async function markAllNotificationsAsRead(token: string): Promise<NotificationActionResponse> {
  return apiRequest("/api/v1/notifications/read-all", notificationActionResponseSchema, {
    method: "PATCH",
  });
}
