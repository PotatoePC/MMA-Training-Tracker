"use client";

import { useState } from "react";
import { X, Lock, Mail, AlertCircle, Sparkles, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { user, isConfigured, signInWithGoogle, signInWithEmail, signUpWithEmail, signOutUser } =
    useAuth();

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setError(null);
    setSubmitting(true);
    try {
      await signInWithGoogle();
      onClose();
    } catch (err: unknown) {
      const errorObj = err as { code?: string; message?: string };
      if (errorObj?.code !== "auth/popup-closed-by-user") {
        setError(errorObj?.message || "Failed to sign in with Google.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (mode === "login") {
        await signInWithEmail(email, password);
      } else {
        await signUpWithEmail(email, password);
      }
      onClose();
    } catch (err: unknown) {
      const errorObj = err as { code?: string; message?: string };
      let msg = errorObj?.message || "Authentication failed.";
      if (errorObj?.code === "auth/invalid-credential" || errorObj?.code === "auth/user-not-found" || errorObj?.code === "auth/wrong-password") {
        msg = "Invalid email or password.";
      } else if (errorObj?.code === "auth/email-already-in-use") {
        msg = "An account with this email already exists.";
      } else if (errorObj?.code === "auth/weak-password") {
        msg = "Password should be at least 6 characters.";
      }
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative z-10 w-full max-w-md rounded-3xl border border-white/10 bg-[#1c1c1e] p-6 shadow-2xl ring-1 ring-white/5">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-zinc-500 transition hover:bg-zinc-800 hover:text-zinc-200"
        >
          <X className="h-5 w-5" />
        </button>

        {user ? (
          <div className="text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <h3 className="text-lg font-semibold text-zinc-100">
              Cloud Sync Active
            </h3>
            <p className="mt-1 text-xs text-zinc-400">
              Signed in as <span className="text-zinc-200 font-medium">{user.email}</span>
            </p>
            <p className="mt-2 text-xs text-zinc-500">
              Your workouts and metrics sync automatically across your phone and laptop in real-time.
            </p>

            <div className="mt-6 flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-xl bg-zinc-800 py-2.5 text-sm font-medium text-zinc-200 hover:bg-zinc-700 transition"
              >
                Close
              </button>
              <button
                type="button"
                onClick={async () => {
                  await signOutUser();
                  onClose();
                }}
                className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm font-medium text-red-400 hover:bg-red-500/20 transition"
              >
                Sign Out
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-5 text-center">
              <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0A84FF]/15 text-[#0A84FF] ring-1 ring-[#0A84FF]/30">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold tracking-tight text-zinc-100">
                {mode === "login" ? "Sign In to Sync Workouts" : "Create Sync Account"}
              </h3>
              <p className="mt-1 text-xs text-zinc-400">
                Access your training logs from your phone and computer seamlessly.
              </p>
            </div>

            {!isConfigured && (
              <div className="mb-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200">
                <p className="font-semibold">Firebase keys not set yet</p>
                <p className="mt-0.5 text-amber-300/80">
                  Add your Firebase keys to <code className="rounded bg-black/40 px-1 py-0.5">.env.local</code> to enable real-time cloud sync. Local guest mode remains active.
                </p>
              </div>
            )}

            {error && (
              <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            {isConfigured && (
              <>
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={submitting}
                  className="flex w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-[#2c2c2e] py-3 text-sm font-semibold text-zinc-100 shadow-sm transition hover:bg-[#3a3a3c] disabled:opacity-50"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24">
                    <path
                      fill="#EA4335"
                      d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z"
                    />
                    <path
                      fill="#4285F4"
                      d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15.2s.7 5.5 1.9 7.9l3.7-2.9z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23.5c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16.5C3.7 20.2 7.5 23.5 12 23.5z"
                    />
                  </svg>
                  Continue with Google
                </button>

                <div className="my-4 flex items-center gap-3">
                  <div className="h-px flex-1 bg-white/10" />
                  <span className="text-[11px] uppercase tracking-wider text-zinc-500">
                    Or with email
                  </span>
                  <div className="h-px flex-1 bg-white/10" />
                </div>

                <form onSubmit={handleEmailSubmit} className="space-y-3">
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email address"
                      required
                      className="w-full rounded-xl border border-white/10 bg-[#2c2c2e] py-2.5 pl-9 pr-3 text-sm text-zinc-100 placeholder:text-zinc-500 outline-none focus:border-[#0A84FF]/50 focus:ring-2 focus:ring-[#0A84FF]/20"
                    />
                  </div>

                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password"
                      required
                      minLength={6}
                      className="w-full rounded-xl border border-white/10 bg-[#2c2c2e] py-2.5 pl-9 pr-3 text-sm text-zinc-100 placeholder:text-zinc-500 outline-none focus:border-[#0A84FF]/50 focus:ring-2 focus:ring-[#0A84FF]/20"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full rounded-xl bg-[#0A84FF] py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-500/20 transition hover:bg-blue-500 disabled:opacity-50"
                  >
                    {submitting
                      ? "Please wait…"
                      : mode === "login"
                        ? "Sign In"
                        : "Create Account"}
                  </button>
                </form>

                <div className="mt-4 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setMode(mode === "login" ? "signup" : "login");
                      setError(null);
                    }}
                    className="text-xs text-zinc-400 hover:text-zinc-200 transition"
                  >
                    {mode === "login"
                      ? "Don't have an account? Sign up"
                      : "Already have an account? Sign in"}
                  </button>
                </div>
              </>
            )}

            <div className="mt-5 border-t border-white/8 pt-3 text-center">
              <button
                type="button"
                onClick={onClose}
                className="text-xs text-zinc-500 hover:text-zinc-400 transition"
              >
                Continue in guest mode (stored only on this browser)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
