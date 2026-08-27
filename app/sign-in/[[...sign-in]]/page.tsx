"use client";

import React, { useState, useEffect, useRef, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import {
  Mail,
  ArrowRight,
  Loader2,
  KeyRound,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Lock,
} from "lucide-react";
import { requestAdminOtp, verifyAdminOtp, logoutAdmin } from "@/services/authService";
import { useUserStore } from "@/store/useUserStore";
import { getAccessToken, clearTokens } from "@/lib/api/client";
import { toast } from "@/components/ui/toast";
import { isStaff, getDefaultLandingPath } from "@/lib/rbac";
import { getErrorMessage } from "@/lib/errors";

const emptySubscribe = () => () => {};

export default function SignInPage() {
  const router = useRouter();
  const { fetchProfile, backendUser, clearBackendUser } = useUserStore();

  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendCountdown, setResendCountdown] = useState(0);
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);

  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // Check if already logged in — skip re-fetch when store already has a staff user
  useEffect(() => {
    if (backendUser && isStaff(backendUser.role)) {
      router.replace(getDefaultLandingPath(backendUser.role));
      return;
    }

    const token = getAccessToken();
    if (!token) return;

    let cancelled = false;
    fetchProfile().then((user) => {
      if (cancelled) return;
      if (user && isStaff(user.role)) {
        router.replace(getDefaultLandingPath(user.role));
        return;
      }
      clearBackendUser();
    });
    return () => {
      cancelled = true;
    };
  }, [backendUser, fetchProfile, clearBackendUser, router]);

  // Countdown timer for OTP resend
  useEffect(() => {
    if (resendCountdown <= 0) return;
    const timer = setInterval(() => {
      setResendCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCountdown]);

  // Handle Step 1: Request OTP
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !trimmedEmail.includes("@")) {
      setError("Please enter a valid work email address.");
      return;
    }

    try {
      setLoading(true);
      await requestAdminOtp(trimmedEmail);
      toast.success("Authentication code sent to your email!");
      setStep("otp");
      setResendCountdown(60);
      setTimeout(() => {
        otpInputsRef.current[0]?.focus();
      }, 100);
    } catch (err: unknown) {
      console.error("Failed to request OTP:", err);
      // For anti-enumeration, backend typically succeeds, but if an actual network error occurs:
      setError(getErrorMessage(err, "Failed to send OTP. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP digit inputs
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    if (value.length > 1) {
      // Handle paste
      const pasted = value.slice(0, 6).split("");
      pasted.forEach((char, i) => {
        if (i < 6) newOtp[i] = char;
      });
      setOtp(newOtp);
      const nextIndex = Math.min(pasted.length, 5);
      otpInputsRef.current[nextIndex]?.focus();
      return;
    }

    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-advance to next input
    if (value && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  // Handle Step 2: Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const fullOtp = otp.join("");
    if (fullOtp.length !== 6) {
      setError("Please enter the complete 6-digit security code.");
      return;
    }

    try {
      setLoading(true);
      await verifyAdminOtp(email.trim().toLowerCase(), fullOtp);

      // Verify staff role via profile
      const user = await fetchProfile();
      if (!user || !isStaff(user.role)) {
        try {
          await logoutAdmin();
        } catch {
          clearTokens();
        }
        setError("Access Denied: Your account is not authorized as admin or support staff.");
        return;
      }

      toast.success(
        user.role === "support" ? "Welcome back (Support)!" : "Welcome back!"
      );
      router.push(getDefaultLandingPath(user.role));
    } catch (err: unknown) {
      console.error("OTP verification failed:", err);
      setError(getErrorMessage(err, "Invalid or expired security code. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCountdown > 0 || loading) return;
    setError(null);

    try {
      setLoading(true);
      await requestAdminOtp(email.trim().toLowerCase());
      toast.success("A fresh security code has been sent.");
      setResendCountdown(60);
      setOtp(["", "", "", "", "", ""]);
      otpInputsRef.current[0]?.focus();
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to resend code."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden text-slate-100 selection:bg-blue-500 selection:text-white">
      {/* Background Decorative Gradient Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8 space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-bold text-white text-2xl shadow-xl shadow-blue-500/20 mx-auto border border-blue-400/30">
            P
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Paykop Admin Portal</h1>
          <p className="text-xs text-slate-400 font-medium">Secure Two-Factor Administrative Access</p>
        </div>

        {/* Card Container */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-8 shadow-2xl space-y-6">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-800/50 text-red-300 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{error}</div>
            </div>
          )}

          {step === "email" ? (
            /* Step 1: Work Email Form */
            <form onSubmit={handleRequestOtp} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-blue-400" /> Work Email
                </label>
                <div className="relative" suppressHydrationWarning>
                  {mounted ? (
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@paykop.com"
                      autoFocus
                      required
                      disabled={loading}
                      autoComplete="username"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition disabled:opacity-50"
                    />
                  ) : (
                    <div
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-500 h-[46px]"
                      aria-hidden
                    />
                  )}
                </div>
                <p className="text-[11px] text-slate-500">
                  Enter your registered admin or support staff email to receive a one-time verification code.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || !email}
                className="w-full bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sending Code...</span>
                  </>
                ) : (
                  <>
                    <span>Continue with OTP</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* Step 2: 6-Digit OTP Form */
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div className="text-center space-y-1">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mx-auto">
                  <KeyRound className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white">Enter Security Code</h3>
                <p className="text-xs text-slate-400">
                  We sent a 6-digit code to <span className="text-slate-200 font-semibold">{email}</span>
                </p>
              </div>

              {/* 6 Digit Input Group */}
              <div className="flex justify-between gap-1.5 sm:gap-2">
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => {
                      otpInputsRef.current[idx] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    disabled={loading}
                    className="flex-1 min-w-0 max-w-12 h-12 sm:h-14 bg-slate-950 border border-slate-800 rounded-xl text-center text-lg sm:text-xl font-mono font-bold text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition disabled:opacity-50"
                  />
                ))}
              </div>

              {/* Verify Button */}
              <button
                type="submit"
                disabled={loading || otp.some((d) => !d)}
                className="w-full bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying Session...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Verify & Sign In</span>
                  </>
                )}
              </button>

              {/* Footer controls: Resend and Change Email */}
              <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={() => {
                    setStep("email");
                    setOtp(["", "", "", "", "", ""]);
                    setError(null);
                  }}
                  className="hover:text-slate-200 transition cursor-pointer"
                >
                  Change email
                </button>

                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendCountdown > 0 || loading}
                  className="flex items-center gap-1 hover:text-blue-400 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RotateCcw className="w-3 h-3" />
                  {resendCountdown > 0 ? (
                    <span>Resend in {resendCountdown}s</span>
                  ) : (
                    <span>Resend Code</span>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer Security Badge */}
        <div className="mt-8 text-center flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
          <Lock className="w-3.5 h-3.5 text-emerald-500" />
          <span>Encrypted with JWT & Role-Based Authorization</span>
        </div>
      </div>
    </div>
  );
}
