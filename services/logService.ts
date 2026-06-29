// src/services/logService.ts
import { apiRequest } from "./apiService";
import { auditLogListResponseSchema, AuditLogListResponse } from "../schemas/logSchema";

/**
 * Fetch Audit Logs
 */
export async function fetchAdminLogs(token: string, page = 1, limit = 10): Promise<AuditLogListResponse> {
  console.log(`[API] Fetching logs Page: ${page}, Limit: ${limit}`);
  return apiRequest("/api/v1/admin/logs", auditLogListResponseSchema, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params: {
      page: page.toString(),
      limit: limit.toString(),
    },
  });
}
