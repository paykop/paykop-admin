// src/components/ProfileForm.tsx
"use client";

import React, { useState } from "react";
import { useUserStore } from "../store/useUserStore";
import { userProfileSchema, UserProfileInput } from "../schemas/userSchema";

export default function ProfileForm() {
  const { profile, setProfile, clearProfile } = useUserStore();
  const [formData, setFormData] = useState<UserProfileInput>({
    username: "",
    email: "",
    role: "user",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof UserProfileInput, string>>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate with Zod
    const result = userProfileSchema.safeParse(formData);

    if (!result.success) {
      const formattedErrors: Partial<Record<keyof UserProfileInput, string>> = {};
      result.error.issues.forEach((issue) => {
        const pathKey = issue.path[0] as keyof UserProfileInput;
        formattedErrors[pathKey] = issue.message;
      });
      setErrors(formattedErrors);
      return;
    }

    // Reset errors and save profile to Zustand store
    setErrors({});
    setProfile(result.data);
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl text-slate-100">
      <h2 className="text-xl font-bold mb-4 text-emerald-400">Verify Project Setup</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-slate-300">Username</label>
          <input
            type="text"
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
          />
          {errors.username && <p className="text-red-400 text-xs mt-1">{errors.username}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-slate-300">Email</label>
          <input
            type="email"
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-slate-300">Role</label>
          <select
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value as UserProfileInput["role"] })}
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
            <option value="guest">Guest</option>
          </select>
        </div>

        <button
          type="submit"
          className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold py-2 px-4 rounded-lg transition duration-200"
        >
          Submit & Save in Zustand
        </button>
      </form>

      {profile && (
        <div className="mt-6 p-4 bg-slate-800 rounded-xl border border-slate-700">
          <h3 className="font-semibold text-emerald-400 mb-2">Stored Zustand State:</h3>
          <pre className="text-xs font-mono bg-slate-950 p-2 rounded text-emerald-300">
            {JSON.stringify(profile, null, 2)}
          </pre>
          <button
            onClick={clearProfile}
            className="mt-3 text-xs text-red-400 hover:text-red-300 underline"
          >
            Clear State
          </button>
        </div>
      )}
    </div>
  );
}
