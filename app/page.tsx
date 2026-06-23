import ProfileForm from "../components/ProfileForm";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-emerald-500/30 selection:text-emerald-300">
      {/* Header */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center font-bold text-slate-950 text-lg shadow-lg shadow-emerald-500/20">
              P
            </div>
            <span className="font-semibold text-lg tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              Paykop Admin
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium text-slate-400">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Workspace Active
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-12 flex flex-col lg:flex-row items-center lg:items-stretch gap-12 justify-center">
        {/* Info Column */}
        <div className="flex flex-col justify-center max-w-lg lg:w-1/2 space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 w-fit block">
              Tech Stack Configured
            </span>
            <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight leading-none bg-gradient-to-b from-white to-slate-400 bg-clip-text text-transparent">
              Robust & Scalable Admin Panel
            </h1>
          </div>

          <p className="text-slate-400 leading-relaxed text-sm">
            Your environment has been successfully configured with the requested modern workspace tech stack.
            Below is a brief breakdown of the structural components and their roles in this admin setup.
          </p>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-900 hover:border-slate-800 transition duration-200">
              <h3 className="font-semibold text-slate-200 mb-1">⚡ Next.js (App Router)</h3>
              <p className="text-slate-500 leading-normal">Optimized React framework with layout nesting, file-based routing, and built-in optimization.</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-900 hover:border-slate-800 transition duration-200">
              <h3 className="font-semibold text-slate-200 mb-1">🎨 Tailwind CSS v4</h3>
              <p className="text-slate-500 leading-normal">Modern styling using responsive utility classes directly defined inside the theme.</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-900 hover:border-slate-800 transition duration-200">
              <h3 className="font-semibold text-slate-200 mb-1">🐻 Zustand State</h3>
              <p className="text-slate-500 leading-normal">Lightweight and high-performance state management store keeping your UI synchronized.</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-900 hover:border-slate-800 transition duration-200">
              <h3 className="font-semibold text-slate-200 mb-1">🛡️ Zod Validation</h3>
              <p className="text-slate-500 leading-normal">Type-safe schema validation to ensure frontend input integrity before API submission.</p>
            </div>
          </div>
        </div>

        {/* Demo App Column */}
        <div className="w-full lg:w-1/2 flex items-center justify-center">
          <ProfileForm />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/40 text-slate-600 text-xs py-6">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 Paykop. All rights reserved.</p>
          <div className="flex gap-4">
            <span className="hover:text-slate-400 cursor-pointer transition">Documentation</span>
            <span>•</span>
            <span className="hover:text-slate-400 cursor-pointer transition">Workspace Settings</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
