/** Machine-readable endpoint inventory for backend ↔ web sync verification. */

export type SyncStatus =
  | "synced"
  | "service-only"
  | "backend-only"
  | "web-only"
  | "pending-verify";

export interface EndpointEntry {
  domain: string;
  method: string;
  path: string;
  serviceFn: string;
  serviceFile: string;
  schema: string;
  ui: string;
  status: SyncStatus;
  notes?: string;
}

export const ENDPOINT_INVENTORY: EndpointEntry[] = [
  // Auth (BFF + Go)
  { domain: "Auth", method: "POST", path: "/api/v1/admin/auth/otp/request", serviceFn: "requestAdminOtp", serviceFile: "authService.ts", schema: "authSchema", ui: "/sign-in", status: "synced" },
  { domain: "Auth", method: "POST", path: "/api/v1/admin/auth/otp/verify", serviceFn: "verifyAdminOtp", serviceFile: "authService.ts", schema: "authSchema", ui: "/sign-in", status: "synced" },
  { domain: "Auth", method: "GET", path: "/api/auth/session", serviceFn: "resolveSessionStatus", serviceFile: "authService.ts", schema: "authSchema", ui: "global", status: "synced", notes: "Next.js BFF route" },
  { domain: "Auth", method: "POST", path: "/api/v1/admin/auth/refresh", serviceFn: "refreshTokensFromBackend", serviceFile: "lib/auth/server.ts", schema: "authSchema", ui: "proxy", status: "synced", notes: "Server-side only" },
  { domain: "Auth", method: "POST", path: "/api/v1/admin/auth/logout", serviceFn: "logoutAdmin", serviceFile: "authService.ts", schema: "authSchema", ui: "sidebar", status: "synced" },

  // Users
  { domain: "Users", method: "GET", path: "/api/v1/auth/me", serviceFn: "fetchUserProfile", serviceFile: "userService.ts", schema: "userSchema", ui: "global", status: "synced" },
  { domain: "Users", method: "PATCH", path: "/api/v1/users/me", serviceFn: "updateUserProfile", serviceFile: "userService.ts", schema: "userSchema", ui: "/settings", status: "synced" },
  { domain: "Users", method: "GET", path: "/api/v1/users/me/permissions", serviceFn: "fetchUserPermissions", serviceFile: "userService.ts", schema: "userSchema", ui: "/devtools", status: "synced" },
  { domain: "Users", method: "GET", path: "/api/v1/admin/users", serviceFn: "fetchUsers", serviceFile: "userService.ts", schema: "userSchema", ui: "/users", status: "synced" },
  { domain: "Users", method: "GET", path: "/api/v1/admin/users/:id", serviceFn: "getUser", serviceFile: "userService.ts", schema: "userSchema", ui: "/users", status: "synced" },
  { domain: "Users", method: "PUT", path: "/api/v1/admin/users/:id", serviceFn: "updateUser", serviceFile: "userService.ts", schema: "userSchema", ui: "/users", status: "synced", notes: "Name updates only" },
  { domain: "Users", method: "PATCH", path: "/api/v1/admin/users/:id/role", serviceFn: "updateUserRole", serviceFile: "userService.ts", schema: "userSchema", ui: "/users", status: "synced", notes: "Role changes via dedicated PATCH" },
  { domain: "Users", method: "PUT", path: "/api/v1/admin/users/:id/suspend", serviceFn: "suspendUser", serviceFile: "userService.ts", schema: "userSchema", ui: "/users", status: "synced" },
  { domain: "Users", method: "PUT", path: "/api/v1/admin/users/:id/verify", serviceFn: "verifyUser", serviceFile: "userService.ts", schema: "userSchema", ui: "/users", status: "synced" },

  // Dashboard
  { domain: "Dashboard", method: "GET", path: "/api/v1/admin/dashboard", serviceFn: "fetchDashboardStats", serviceFile: "dashboardService.ts", schema: "dashboardSchema", ui: "/", status: "synced" },
  { domain: "Dashboard", method: "GET", path: "/api/v1/admin/analytics", serviceFn: "fetchAnalytics", serviceFile: "dashboardService.ts", schema: "dashboardSchema", ui: "/", status: "synced", notes: "Alias of /admin/dashboard" },
  { domain: "Dashboard", method: "GET", path: "/api/v1/admin/metrics", serviceFn: "fetchAdminMetrics", serviceFile: "dashboardService.ts", schema: "dashboardSchema", ui: "/", status: "synced" },
  { domain: "Health", method: "GET", path: "/health", serviceFn: "fetchServerHealth", serviceFile: "userService.ts", schema: "inline", ui: "/devtools", status: "synced" },

  // Tickets
  { domain: "Tickets", method: "GET", path: "/api/v1/admin/tickets", serviceFn: "fetchTickets", serviceFile: "ticketService.ts", schema: "ticketSchema", ui: "/tickets", status: "synced" },
  { domain: "Tickets", method: "GET", path: "/api/v1/admin/tickets/:id", serviceFn: "fetchTicketDetail", serviceFile: "ticketService.ts", schema: "ticketSchema", ui: "/tickets", status: "synced" },
  { domain: "Tickets", method: "PATCH", path: "/api/v1/admin/tickets/:id/status", serviceFn: "updateTicketStatus", serviceFile: "ticketService.ts", schema: "ticketSchema", ui: "/tickets", status: "synced" },
  { domain: "Tickets", method: "POST", path: "/api/v1/admin/tickets/:id/messages", serviceFn: "createTicketReply", serviceFile: "ticketService.ts", schema: "ticketSchema", ui: "/tickets", status: "synced" },

  // KYC
  { domain: "KYC", method: "GET", path: "/api/v1/admin/kyc/submissions", serviceFn: "fetchKycSubmissions", serviceFile: "kycService.ts", schema: "kycSchema", ui: "/kyc", status: "synced" },
  { domain: "KYC", method: "GET", path: "/api/v1/admin/kyc/submissions/:id", serviceFn: "fetchKycSubmission", serviceFile: "kycService.ts", schema: "kycSchema", ui: "/kyc", status: "synced" },
  { domain: "KYC", method: "POST", path: "/api/v1/admin/kyc/submissions/:id/approve", serviceFn: "approveKycSubmission", serviceFile: "kycService.ts", schema: "kycSchema", ui: "/kyc", status: "synced" },
  { domain: "KYC", method: "POST", path: "/api/v1/admin/kyc/submissions/:id/reject", serviceFn: "rejectKycSubmission", serviceFile: "kycService.ts", schema: "kycSchema", ui: "/kyc", status: "synced" },

  // Products
  { domain: "Products", method: "GET", path: "/api/v1/admin/products", serviceFn: "fetchAdminProducts", serviceFile: "productService.ts", schema: "productSchema", ui: "/products", status: "synced" },
  { domain: "Products", method: "PUT", path: "/api/v1/admin/products/:id/status", serviceFn: "updateAdminProductStatus", serviceFile: "productService.ts", schema: "productSchema", ui: "/products", status: "synced" },
  { domain: "Products", method: "DELETE", path: "/api/v1/admin/products/:id", serviceFn: "deleteAdminProduct", serviceFile: "productService.ts", schema: "productSchema", ui: "/products", status: "synced" },

  // Product categories
  { domain: "ProductCategories", method: "GET", path: "/api/v1/admin/categories", serviceFn: "fetchAdminProductCategories", serviceFile: "productCategoryService.ts", schema: "productCategorySchema", ui: "/categories", status: "synced" },
  { domain: "ProductCategories", method: "GET", path: "/api/v1/admin/categories/:id", serviceFn: "fetchAdminProductCategory", serviceFile: "productCategoryService.ts", schema: "productCategorySchema", ui: "/categories", status: "synced" },
  { domain: "ProductCategories", method: "POST", path: "/api/v1/admin/categories", serviceFn: "createAdminProductCategory", serviceFile: "productCategoryService.ts", schema: "productCategorySchema", ui: "/categories", status: "synced" },
  { domain: "ProductCategories", method: "PUT", path: "/api/v1/admin/categories/:id", serviceFn: "updateAdminProductCategory", serviceFile: "productCategoryService.ts", schema: "productCategorySchema", ui: "/categories", status: "synced" },
  { domain: "ProductCategories", method: "PATCH", path: "/api/v1/admin/categories/:id", serviceFn: "patchAdminProductCategory", serviceFile: "productCategoryService.ts", schema: "productCategorySchema", ui: "/categories", status: "service-only", notes: "Available for partial updates" },
  { domain: "ProductCategories", method: "DELETE", path: "/api/v1/admin/categories/:id", serviceFn: "deleteAdminProductCategory", serviceFile: "productCategoryService.ts", schema: "productCategorySchema", ui: "/categories", status: "synced" },

  // Banners
  { domain: "Banners", method: "GET", path: "/api/v1/banners?only_active=false", serviceFn: "fetchAdminBanners", serviceFile: "bannerService.ts", schema: "bannerSchema", ui: "/banners", status: "synced", notes: "Public list endpoint for admin read" },
  { domain: "Banners", method: "GET", path: "/api/v1/banners/:id", serviceFn: "fetchBanner", serviceFile: "bannerService.ts", schema: "bannerSchema", ui: "/banners", status: "synced", notes: "Public banner detail endpoint" },
  { domain: "Banners", method: "POST", path: "/api/v1/admin/banners", serviceFn: "createAdminBanner", serviceFile: "bannerService.ts", schema: "bannerSchema", ui: "/banners", status: "synced" },
  { domain: "Banners", method: "PUT", path: "/api/v1/admin/banners/:id", serviceFn: "updateAdminBanner", serviceFile: "bannerService.ts", schema: "bannerSchema", ui: "/banners", status: "synced" },
  { domain: "Banners", method: "DELETE", path: "/api/v1/admin/banners/:id", serviceFn: "deleteAdminBanner", serviceFile: "bannerService.ts", schema: "bannerSchema", ui: "/banners", status: "synced" },

  // Agents
  { domain: "Agents", method: "GET", path: "/api/v1/admin/agents", serviceFn: "fetchAgents", serviceFile: "agentService.ts", schema: "agentSchema", ui: "/agents", status: "synced" },
  { domain: "Agents", method: "POST", path: "/api/v1/admin/agents", serviceFn: "createAgent", serviceFile: "agentService.ts", schema: "agentSchema", ui: "/agents", status: "synced" },
  { domain: "Agents", method: "GET", path: "/api/v1/admin/agents/:id", serviceFn: "getAgent", serviceFile: "agentService.ts", schema: "agentSchema", ui: "/agents", status: "synced" },
  { domain: "Agents", method: "GET", path: "/api/v1/admin/agents/:id/assignments", serviceFn: "listAgentAssignments", serviceFile: "agentService.ts", schema: "agentSchema", ui: "/agents", status: "synced" },
  { domain: "Agents", method: "PATCH", path: "/api/v1/admin/agents/:id/revoke-role", serviceFn: "revokeAgentRole", serviceFile: "agentService.ts", schema: "agentSchema", ui: "/agents", status: "synced" },
  { domain: "Agents", method: "POST", path: "/api/v1/admin/seller-agent-assignments", serviceFn: "assignSellerToAgent", serviceFile: "agentService.ts", schema: "agentSchema", ui: "/agents", status: "synced" },
  { domain: "Agents", method: "POST", path: "/api/v1/admin/seller-agent-assignments/:id/revoke", serviceFn: "revokeAssignment", serviceFile: "agentService.ts", schema: "agentSchema", ui: "/agents", status: "synced" },

  // Support staff
  { domain: "Support", method: "GET", path: "/api/v1/admin/support", serviceFn: "fetchSupportStaff", serviceFile: "supportService.ts", schema: "supportSchema", ui: "/support", status: "synced" },
  { domain: "Support", method: "POST", path: "/api/v1/admin/support", serviceFn: "createSupportStaff", serviceFile: "supportService.ts", schema: "supportSchema", ui: "/support", status: "synced" },
  { domain: "Support", method: "GET", path: "/api/v1/admin/support/:id", serviceFn: "fetchSupportDetail", serviceFile: "supportService.ts", schema: "supportSchema", ui: "/support", status: "synced" },
  { domain: "Support", method: "PATCH", path: "/api/v1/admin/support/:id/revoke-role", serviceFn: "revokeSupportRole", serviceFile: "supportService.ts", schema: "supportSchema", ui: "/support", status: "synced" },

  // Payments
  { domain: "Payments", method: "GET", path: "/api/v1/admin/payments", serviceFn: "fetchPayments", serviceFile: "paymentService.ts", schema: "paymentSchema", ui: "/payments", status: "synced" },
  { domain: "Payments", method: "POST", path: "/api/v1/admin/refunds/:id", serviceFn: "processRefund", serviceFile: "paymentService.ts", schema: "paymentSchema", ui: "/payments", status: "synced" },
  { domain: "Payments", method: "GET", path: "/api/v1/admin/reports/transactions", serviceFn: "fetchTransactionReport", serviceFile: "paymentService.ts", schema: "paymentSchema", ui: "/payments", status: "synced" },

  // Commerce
  { domain: "Commerce", method: "GET", path: "/api/v1/admin/commerce/settings", serviceFn: "fetchCommerceSettings", serviceFile: "commerceService.ts", schema: "commerceSchema", ui: "/commerce", status: "synced" },
  { domain: "Commerce", method: "PUT", path: "/api/v1/admin/commerce/settings", serviceFn: "updateCommerceSettings", serviceFile: "commerceService.ts", schema: "commerceSchema", ui: "/commerce", status: "synced" },
  { domain: "Commerce", method: "GET", path: "/api/v1/admin/commissions/batches", serviceFn: "fetchCommissionBatches", serviceFile: "commerceService.ts", schema: "commerceSchema", ui: "/commerce", status: "synced" },
  { domain: "Commerce", method: "GET", path: "/api/v1/admin/commissions/batches/:id", serviceFn: "fetchCommissionBatchDetail", serviceFile: "commerceService.ts", schema: "commerceSchema", ui: "/commerce", status: "synced" },
  { domain: "Commerce", method: "PATCH", path: "/api/v1/admin/commissions/batches/:id/mark-paid", serviceFn: "markCommissionBatchPaid", serviceFile: "commerceService.ts", schema: "commerceSchema", ui: "/commerce", status: "synced" },
  { domain: "Commerce", method: "POST", path: "/api/v1/admin/sellers/:id/commission-override", serviceFn: "setSellerCommissionOverride", serviceFile: "commerceService.ts", schema: "commerceSchema", ui: "/commerce", status: "synced", notes: "Custom merchant commission override" },

  // Subscriptions
  { domain: "Subscriptions", method: "GET", path: "/api/v1/admin/subscriptions/plans", serviceFn: "fetchSubscriptionPlans", serviceFile: "subscriptionService.ts", schema: "subscriptionSchema", ui: "/subscriptions", status: "synced" },
  { domain: "Subscriptions", method: "POST", path: "/api/v1/admin/subscriptions", serviceFn: "createSubscriptionPlan", serviceFile: "subscriptionService.ts", schema: "subscriptionSchema", ui: "/subscriptions", status: "synced" },
  { domain: "Subscriptions", method: "PUT", path: "/api/v1/admin/subscriptions/:id", serviceFn: "updateSubscriptionPlan", serviceFile: "subscriptionService.ts", schema: "subscriptionSchema", ui: "/subscriptions", status: "synced" },
  { domain: "Subscriptions", method: "DELETE", path: "/api/v1/admin/subscriptions/:id", serviceFn: "deleteSubscriptionPlan", serviceFile: "subscriptionService.ts", schema: "subscriptionSchema", ui: "/subscriptions", status: "synced" },
  { domain: "Subscriptions", method: "GET", path: "/api/v1/admin/subscriptions/history", serviceFn: "fetchSubscriptionHistory", serviceFile: "subscriptionService.ts", schema: "subscriptionSchema", ui: "/subscriptions", status: "synced" },
  { domain: "Subscriptions", method: "GET", path: "/api/v1/admin/subscriptions/reconciliation", serviceFn: "fetchSubscriptionReconciliations", serviceFile: "subscriptionService.ts", schema: "subscriptionSchema", ui: "/subscriptions", status: "synced" },
  { domain: "Subscriptions", method: "POST", path: "/api/v1/admin/subscriptions/reconciliation/:id/resolve", serviceFn: "resolveSubscriptionReconciliation", serviceFile: "subscriptionService.ts", schema: "subscriptionSchema", ui: "/subscriptions", status: "synced" },

  // Campaigns
  { domain: "Campaigns", method: "GET", path: "/api/v1/admin/campaigns", serviceFn: "fetchCampaigns", serviceFile: "campaignService.ts", schema: "campaignSchema", ui: "/campaigns", status: "synced" },
  { domain: "Campaigns", method: "POST", path: "/api/v1/admin/campaigns", serviceFn: "createCampaign", serviceFile: "campaignService.ts", schema: "campaignSchema", ui: "/campaigns", status: "synced" },
  { domain: "Campaigns", method: "PUT", path: "/api/v1/admin/campaigns/:id", serviceFn: "updateCampaign", serviceFile: "campaignService.ts", schema: "campaignSchema", ui: "/campaigns", status: "synced" },
  { domain: "Campaigns", method: "DELETE", path: "/api/v1/admin/campaigns/:id", serviceFn: "deleteCampaign", serviceFile: "campaignService.ts", schema: "campaignSchema", ui: "/campaigns", status: "synced" },

  // Blood
  { domain: "Blood", method: "GET", path: "/api/v1/admin/blood", serviceFn: "fetchBloodRequests", serviceFile: "bloodService.ts", schema: "bloodSchema", ui: "/blood", status: "synced" },
  { domain: "Blood", method: "PUT", path: "/api/v1/admin/blood/:id/status", serviceFn: "updateBloodRequestStatus", serviceFile: "bloodService.ts", schema: "bloodSchema", ui: "/blood", status: "synced" },
  { domain: "Blood", method: "PUT", path: "/api/v1/admin/blood/:id", serviceFn: "updateBloodRequest", serviceFile: "bloodService.ts", schema: "bloodSchema", ui: "/blood", status: "synced" },
  { domain: "Blood", method: "DELETE", path: "/api/v1/admin/blood/:id", serviceFn: "deleteBloodRequest", serviceFile: "bloodService.ts", schema: "bloodSchema", ui: "/blood", status: "synced" },
  { domain: "Blood", method: "GET", path: "/api/v1/donations/blood/donors", serviceFn: "fetchStandingDonors", serviceFile: "bloodService.ts", schema: "bloodSchema", ui: "/blood", status: "synced" },
  { domain: "Blood", method: "GET", path: "/api/v1/donations/blood/:requestId/matching-donors", serviceFn: "fetchMatchingDonors", serviceFile: "bloodService.ts", schema: "bloodSchema", ui: "/blood", status: "synced" },

  // Service categories
  { domain: "ServiceCategories", method: "GET", path: "/api/v1/admin/service-categories", serviceFn: "fetchAdminServiceCategories", serviceFile: "serviceCategoryService.ts", schema: "serviceCategorySchema", ui: "/service-categories", status: "synced" },
  { domain: "ServiceCategories", method: "GET", path: "/api/v1/admin/service-categories/:id", serviceFn: "fetchAdminServiceCategory", serviceFile: "serviceCategoryService.ts", schema: "serviceCategorySchema", ui: "/service-categories", status: "synced" },
  { domain: "ServiceCategories", method: "POST", path: "/api/v1/admin/service-categories", serviceFn: "createAdminServiceCategory", serviceFile: "serviceCategoryService.ts", schema: "serviceCategorySchema", ui: "/service-categories", status: "synced" },
  { domain: "ServiceCategories", method: "PUT", path: "/api/v1/admin/service-categories/:id", serviceFn: "updateAdminServiceCategory", serviceFile: "serviceCategoryService.ts", schema: "serviceCategorySchema", ui: "/service-categories", status: "synced" },
  { domain: "ServiceCategories", method: "PATCH", path: "/api/v1/admin/service-categories/:id", serviceFn: "patchAdminServiceCategory", serviceFile: "serviceCategoryService.ts", schema: "serviceCategorySchema", ui: "/service-categories", status: "service-only", notes: "Available via store patchCategory for partial updates" },
  { domain: "ServiceCategories", method: "DELETE", path: "/api/v1/admin/service-categories/:id", serviceFn: "deleteAdminServiceCategory", serviceFile: "serviceCategoryService.ts", schema: "serviceCategorySchema", ui: "/service-categories", status: "synced" },

  // Organizations (donation NGOs)
  { domain: "Organizations", method: "GET", path: "/api/v1/admin/organizations", serviceFn: "fetchOrganizations", serviceFile: "organizationService.ts", schema: "organizationSchema", ui: "/organizations", status: "synced" },
  { domain: "Organizations", method: "GET", path: "/api/v1/admin/organizations/:id", serviceFn: "fetchOrganization", serviceFile: "organizationService.ts", schema: "organizationSchema", ui: "/organizations", status: "synced" },
  { domain: "Organizations", method: "POST", path: "/api/v1/admin/organizations", serviceFn: "createOrganization", serviceFile: "organizationService.ts", schema: "organizationSchema", ui: "/organizations", status: "synced" },
  { domain: "Organizations", method: "PATCH", path: "/api/v1/admin/organizations/:id/kyc", serviceFn: "updateOrganizationKYC", serviceFile: "organizationService.ts", schema: "organizationSchema", ui: "/organizations", status: "synced" },

  // Donation ledger
  { domain: "Donations", method: "GET", path: "/api/v1/admin/donations", serviceFn: "fetchAdminDonations", serviceFile: "donationService.ts", schema: "donationSchema", ui: "/donations", status: "synced" },
  { domain: "Donations", method: "PATCH", path: "/api/v1/admin/donations/:id/reconcile-confirm", serviceFn: "confirmDonationReconciliation", serviceFile: "donationService.ts", schema: "donationSchema", ui: "/donations", status: "synced" },

  // Payouts
  { domain: "Payouts", method: "GET", path: "/api/v1/admin/payouts", serviceFn: "fetchAdminPayouts", serviceFile: "payoutService.ts", schema: "payoutSchema", ui: "/payouts", status: "synced" },
  { domain: "Payouts", method: "GET", path: "/api/v1/admin/payouts/:id", serviceFn: "fetchAdminPayout", serviceFile: "payoutService.ts", schema: "payoutSchema", ui: "/payouts", status: "synced" },
  { domain: "Payouts", method: "POST", path: "/api/v1/admin/organizations/:id/payouts/preview", serviceFn: "previewOrgPayout", serviceFile: "payoutService.ts", schema: "payoutSchema", ui: "/payouts", status: "synced" },
  { domain: "Payouts", method: "POST", path: "/api/v1/admin/organizations/:id/payouts/run", serviceFn: "runOrgPayoutBatch", serviceFile: "payoutService.ts", schema: "payoutSchema", ui: "/payouts", status: "synced" },
  { domain: "Payouts", method: "PATCH", path: "/api/v1/admin/payouts/:id/approve", serviceFn: "approveAdminPayout", serviceFile: "payoutService.ts", schema: "payoutSchema", ui: "/payouts", status: "synced" },

  // Services moderation
  { domain: "Services", method: "GET", path: "/api/v1/admin/services", serviceFn: "fetchAdminServices", serviceFile: "serviceService.ts", schema: "serviceSchema", ui: "/services", status: "synced" },
  { domain: "Services", method: "PUT", path: "/api/v1/admin/services/:id/status", serviceFn: "updateAdminServiceStatus", serviceFile: "serviceService.ts", schema: "serviceSchema", ui: "/services", status: "synced" },

  // Logs
  { domain: "Logs", method: "GET", path: "/api/v1/admin/logs", serviceFn: "fetchAdminLogs", serviceFile: "logService.ts", schema: "logSchema", ui: "/logs", status: "synced" },

  // Notifications
  { domain: "Notifications", method: "GET", path: "/api/v1/notifications", serviceFn: "fetchNotifications", serviceFile: "notificationService.ts", schema: "notificationSchema", ui: "header", status: "synced" },
  { domain: "Notifications", method: "PATCH", path: "/api/v1/notifications/:id/read", serviceFn: "markNotificationAsRead", serviceFile: "notificationService.ts", schema: "notificationSchema", ui: "header", status: "synced" },
  { domain: "Notifications", method: "PATCH", path: "/api/v1/notifications/read-all", serviceFn: "markAllNotificationsAsRead", serviceFile: "notificationService.ts", schema: "notificationSchema", ui: "header", status: "synced" },

  // Upload
  { domain: "Upload", method: "POST", path: "/api/v1/storage/presigned-url", serviceFn: "uploadImageFile", serviceFile: "uploadService.ts", schema: "inline", ui: "/categories,/service-categories", status: "synced" },
];


export function inventorySummary() {
  const total = ENDPOINT_INVENTORY.length;
  const byStatus = ENDPOINT_INVENTORY.reduce(
    (acc, e) => {
      acc[e.status] = (acc[e.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );
  return { total, byStatus };
}
