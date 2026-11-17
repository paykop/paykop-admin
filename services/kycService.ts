import { apiRequest } from "./apiService";
import {
  kycSubmissionListResponseSchema,
  kycSubmissionSchema,
  KycSubmissionListResponse,
  KycSubmission,
} from "../schemas/kycSchema";

export async function fetchKycSubmissions(
  token: string,
  page = 1,
  limit = 20,
  status?: string
): Promise<KycSubmissionListResponse> {
  const params: Record<string, string> = {
    page: page.toString(),
    limit: limit.toString(),
  };
  if (status && status !== "all") params.status = status;

  return apiRequest("/api/v1/admin/kyc/submissions", kycSubmissionListResponseSchema, {
    params,
  });
}

export async function fetchKycSubmission(
  token: string,
  id: number | string
): Promise<KycSubmission> {
  return apiRequest(`/api/v1/admin/kyc/submissions/${id}`, kycSubmissionSchema, {
  });
}

export async function approveKycSubmission(
  token: string,
  id: number | string
): Promise<KycSubmission> {
  return apiRequest(`/api/v1/admin/kyc/submissions/${id}/approve`, kycSubmissionSchema, {
    method: "POST",
  });
}

export async function rejectKycSubmission(
  token: string,
  id: number | string,
  reason: string
): Promise<KycSubmission> {
  return apiRequest(`/api/v1/admin/kyc/submissions/${id}/reject`, kycSubmissionSchema, {
    method: "POST",
    body: JSON.stringify({ reason }),
  });
}
