import Link from 'next/link';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="text-center text-white">
        <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
        <p className="text-slate-400 mb-6">
          This portal is restricted to authorized administrators only.
        </p>
        <Link
          href="/sign-in"
          className="text-blue-400 underline hover:text-blue-300"
        >
          Back to Sign In
        </Link>
      </div>
    </div>
  );
}