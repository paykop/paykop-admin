// lib/tour/tours.ts
import type { Config as DriverConfig, DriveStep } from "driver.js";

export type AdminTourId =
  | "admin-overview"
  | "support-tickets"
  | "kyc-tab"
  | "users-tab";

export interface TourDefinition {
  id: AdminTourId;
  steps: DriveStep[];
  config?: Partial<DriverConfig>;
}

export const TOURS_REGISTRY: Record<AdminTourId, TourDefinition> = {
  // Tour 1: Super Admin Overview Tour
  "admin-overview": {
    id: "admin-overview",
    config: {
      animate: true,
      allowClose: true,
      overlayColor: "rgba(2, 6, 23, 0.75)",
      stagePadding: 6,
      stageRadius: 10,
    },
    steps: [
      {
        element: '[data-tour="header-handshake"]',
        popover: {
          title: "Live Security Handshake",
          description: "Indicates your active authenticated session with the Paykop Go BFF layer.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: '[data-tour="overview-metrics"]',
        popover: {
          title: "Platform Metrics & KPIs",
          description: "Real-time summary of users, active sellers, ticket volume, and system throughput.",
          side: "bottom",
          align: "center",
        },
      },
      {
        element: '[data-tour="sidebar-nav"]',
        popover: {
          title: "Domain Management",
          description: "Full RBAC navigation for commerce, agents, KYC, services, and audit logs.",
          side: "right",
          align: "start",
        },
      },
      {
        element: '[data-tour="header-notifications"]',
        popover: {
          title: "Real-Time Notifications",
          description: "Instant in-app alerts for critical submissions, disputes, and system anomalies.",
          side: "bottom",
          align: "end",
        },
      },
    ],
  },

  // Tour 2: Support Staff Tickets Tour
  "support-tickets": {
    id: "support-tickets",
    config: {
      animate: true,
      allowClose: true,
      overlayColor: "rgba(2, 6, 23, 0.75)",
    },
    steps: [
      {
        element: '[data-tour="tickets-filter-bar"]',
        popover: {
          title: "Ticket Queue Filters",
          description: "Filter tickets by status (Open, In Progress, Resolved) or search by ID/keyword.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: '[data-tour="tickets-list"]',
        popover: {
          title: "Active Ticket Feed",
          description: "Select any ticket to review the customer history and assign handling priority.",
          side: "right",
          align: "center",
        },
      },
      {
        element: '[data-tour="tickets-reply-box"]',
        popover: {
          title: "Support Messaging Thread",
          description: "Send direct replies to users and update resolution status with idempotency protection.",
          side: "top",
          align: "start",
        },
      },
    ],
  },

  // Tour 3: KYC Moderation Tour
  "kyc-tab": {
    id: "kyc-tab",
    steps: [
      {
        element: '[data-tour="kyc-status-tabs"]',
        popover: {
          title: "KYC Review Pipeline",
          description: "Switch between Pending, Approved, and Rejected seller identity verifications.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: '[data-tour="kyc-document-viewer"]',
        popover: {
          title: "Sanitized Document Inspector",
          description: "Inspect business licenses and identity cards with validated remote URLs.",
          side: "left",
          align: "center",
        },
      },
      {
        element: '[data-tour="kyc-actions"]',
        popover: {
          title: "Approve or Reject",
          description: "One-click approval or rejection with mandatory compliance feedback notes.",
          side: "top",
          align: "end",
        },
      },
    ],
  },

  // Tour 4: User Directory Tour
  "users-tab": {
    id: "users-tab",
    steps: [
      {
        element: '[data-tour="users-search-input"]',
        popover: {
          title: "User Directory Search",
          description: "Search users by name, phone, or email prefix.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: '[data-tour="users-role-filter"]',
        popover: {
          title: "Role Filtering",
          description: "Isolate buyers, sellers, agents, and staff members.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: '[data-tour="users-table-actions"]',
        popover: {
          title: "Account Administration",
          description: "Access account suspension, role modification, and seller readiness verification.",
          side: "left",
          align: "center",
        },
      },
    ],
  },
};
