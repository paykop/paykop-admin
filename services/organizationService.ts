import { apiRequest } from "./apiService";
import {
  organizationListResponseSchema,
  organizationSchema,
  OrganizationListResponse,
  Organization,
  CreateOrgRequest,
} from "../schemas/organizationSchema";

export async function fetchOrganizations(
  token: string,
  page = 1,
  limit = 20,
  status?: string
): Promise<OrganizationListResponse> {
  const params: Record<string, string> = {
    page: page.toString(),
    limit: limit.toString(),
  };
  if (status && status !== "all") {
    params.status = status;
  }

  return apiRequest("/api/v1/admin/organizations", organizationListResponseSchema, {
    params,
  });
}

export async function fetchOrganization(
  token: string,
  id: string
): Promise<Organization> {
  return apiRequest(`/api/v1/admin/organizations/${id}`, organizationSchema);
}

export async function createOrganization(
  token: string,
  payload: CreateOrgRequest
): Promise<Organization> {
  return apiRequest("/api/v1/admin/organizations", organizationSchema, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateOrganizationKYC(
  token: string,
  id: string,
  status: "verified" | "rejected",
  rejectionReason?: string
): Promise<Organization> {
  return apiRequest(`/api/v1/admin/organizations/${id}/kyc`, organizationSchema, {
    method: "PATCH",
    body: JSON.stringify({
      status,
      rejection_reason: rejectionReason || undefined,
    }),
  });
}
