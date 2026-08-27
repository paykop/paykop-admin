import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="text-center text-white max-w-md">
        <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
        <p className="text-slate-400 mb-6 leading-relaxed">
          This page requires administrator access. Support staff can access{" "}
          <strong className="text-slate-300">Support Tickets</strong>,{" "}
          <strong className="text-slate-300">Users</strong>, and{" "}
          <strong className="text-slate-300">KYC Submissions</strong> only.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/tickets"
            className="text-blue-400 underline hover:text-blue-300 font-medium"
          >
            Go to Support Tickets
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
