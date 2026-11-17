"use client";

import ApiConsole from "./ApiConsole";
import BackendProfile from "./BackendProfile";

export default function DevToolsTab() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Developer Tools</h2>
        <p className="text-sm text-slate-500 mt-0.5">API smoke tests and backend profile debug</p>
      </div>
      <BackendProfile />
      <ApiConsole />
    </div>
  );
}
