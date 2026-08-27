import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="text-center text-white max-w-md">
        <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
        <p className="text-slate-400 mb-6 leading-relaxed">
          This page requires administrator access. Support staff can use operational pages from the
          dashboard.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/"
            className="text-blue-400 underline hover:text-blue-300 font-medium"
          >
            Back to Dashboard
          </Link>
          <Link
            href="/sign-in"
            className="text-slate-400 underline hover:text-slate-300 text-sm"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
