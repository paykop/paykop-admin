// src/store/useDashboardStore.ts
import { create } from "zustand";

export interface Campaign {
  id: string;
  name: string;
  organiser: string;
  goal: string;
  submitted: string;
  status: "pending" | "approved" | "rejected";
}

interface DashboardState {
  campaigns: Campaign[];
  approveCampaign: (id: string) => void;
  rejectCampaign: (id: string) => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  campaigns: [
    {
      id: "monsoon",
      name: "Monsoon relief for flood-hit families",
      organiser: "Sahaya Foundation",
      goal: "₹5,00,000",
      submitted: "Jun 21",
      status: "pending",
    },
    {
      id: "school",
      name: "School supplies for 300 children",
      organiser: "Vidya Trust",
      goal: "₹1,20,000",
      submitted: "Jun 22",
      status: "pending",
    },
    {
      id: "cancer",
      name: "Cancer treatment support — Ravi K.",
      organiser: "Individual",
      goal: "₹8,00,000",
      submitted: "Jun 22",
      status: "pending",
    },
  ],
  approveCampaign: (id) =>
    set((state) => ({
      campaigns: state.campaigns.map((c) =>
        c.id === id ? { ...c, status: "approved" as const } : c
      ),
    })),
  rejectCampaign: (id) =>
    set((state) => ({
      campaigns: state.campaigns.map((c) =>
        c.id === id ? { ...c, status: "rejected" as const } : c
      ),
    })),
}));
