"use client";

import ProfileForm from "./ProfileForm";

export default function SettingsTab() {
  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Account Settings</h2>
        <p className="text-sm text-slate-500 mt-0.5">Update your admin profile</p>
      </div>
      <ProfileForm />
    </div>
  );
}
