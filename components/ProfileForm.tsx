// src/components/ProfileForm.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/useAuth";
import { useUserStore } from "../store/useUserStore";
import { updateProfileSchema, UpdateProfileInput } from "../schemas/userSchema";
import { updateUserProfile } from "../services/userService";
import { Loader2, Settings } from "lucide-react";

export default function ProfileForm() {
  const { backendUser, fetchProfile } = useUserStore();
  const { getToken } = useAuth();
  
  const [formData, setFormData] = useState<UpdateProfileInput>({
    first_name: "",
    last_name: "",
    phone: "",
    address: "",
  });
  
  const [errors, setErrors] = useState<Partial<Record<keyof UpdateProfileInput, string>>>({});
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Sync state from backendUser when loaded
  useEffect(() => {
    if (backendUser) {
      setFormData({
        first_name: backendUser.first_name || "",
        last_name: backendUser.last_name || "",
        phone: backendUser.phone || "",
        address: backendUser.address || "",
      });
    }
  }, [backendUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(null);

    // Validate with Zod
    const result = updateProfileSchema.safeParse(formData);

    if (!result.success) {
      const formattedErrors: Partial<Record<keyof UpdateProfileInput, string>> = {};
      result.error.issues.forEach((issue) => {
        const pathKey = issue.path[0] as keyof UpdateProfileInput;
        formattedErrors[pathKey] = issue.message;
      });
      setErrors(formattedErrors);
      return;
    }

    setErrors({});
    setSaving(true);

    try {
      const token = await getToken();
      if (!token) {
        throw new Error("Unauthorized: No authentication token found");
      }

      // PATCH to backend using our user service
      await updateUserProfile(token, result.data);

      setSuccessMsg("Admin profile updated successfully!");
      // Reload profile to refresh main layout
      await fetchProfile(getToken);
    } catch (err: any) {
      console.error("Profile update failed:", err);
      setErrors({ first_name: err?.message || "Failed to update profile." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl shadow-2xl text-slate-100">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <Settings className="w-4 h-4" />
        </div>
        <h2 className="text-lg font-bold text-white tracking-tight">Admin Account Settings</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold mb-1.5 text-slate-400 uppercase tracking-wider">First Name</label>
          <input
            type="text"
            className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition text-sm"
            placeholder="John"
            value={formData.first_name}
            onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
            suppressHydrationWarning
          />
          {errors.first_name && <p className="text-red-400 text-xs mt-1">{errors.first_name}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1.5 text-slate-400 uppercase tracking-wider">Last Name</label>
          <input
            type="text"
            className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition text-sm"
            placeholder="Doe"
            value={formData.last_name}
            onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
            suppressHydrationWarning
          />
          {errors.last_name && <p className="text-red-400 text-xs mt-1">{errors.last_name}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1.5 text-slate-400 uppercase tracking-wider">Phone Number</label>
          <input
            type="text"
            className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition text-sm"
            placeholder="+1 (555) 000-0000"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            suppressHydrationWarning
          />
          {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1.5 text-slate-400 uppercase tracking-wider">Address</label>
          <textarea
            className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition text-sm min-h-[80px] resize-none"
            placeholder="123 Main St, New York, NY"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            suppressHydrationWarning
          />
          {errors.address && <p className="text-red-400 text-xs mt-1">{errors.address}</p>}
        </div>

        {successMsg && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs">
            {successMsg}
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-slate-950 font-semibold py-2.5 px-4 rounded-xl transition duration-200 text-sm flex items-center justify-center gap-2 cursor-pointer"
          suppressHydrationWarning
        >
          {saving && <Loader2 className="w-4 h-4 animate-spin" />}
          {saving ? "Updating Postgres..." : "Save Profile Details"}
        </button>
      </form>
    </div>
  );
}
