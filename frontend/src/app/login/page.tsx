// LoginPage component for user authentication
// Handles username verification, password entry, and forgot password flow

"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { useAuth } from "@/components/(access-providers)/auth-context";
import LoadingPage from "@/components/LoadingPage";

// Utility function to validate email format
function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function LoginPage() {
  // State variables for login steps, form fields, and errors
  const [step, setStep] = useState(1); // 1: username, 2: password
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSent, setForgotSent] = useState(false);
  const [forgotError, setForgotError] = useState("");
  const [emailChecking, setEmailChecking] = useState(false);
  const [csrfToken, setCsrfToken] = useState("");
  const { login, authFetch, user, loading: authLoading } = useAuth();
  const router = useRouter();

  // Fetch CSRF token on mount
  useEffect(() => {
    authFetch(`${API_URL}/api/csrf/`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setCsrfToken(data.csrfToken))
      .catch(() => {});
  }, [authFetch]);

  // Redirect if user is already logged in
  useEffect(() => {
    if (!authLoading && user) {
      if (!user.groups || user.groups.length === 0) {
        setError("Your account does not have a group.");
      } else if (user.groups[0] === "4syz") {
      router.replace("/start/dashboard");
      } else {
        router.replace("/clients/dashboard");
      }
    }
  }, [user, authLoading, router]);

  // Handle username step: verify if username exists before proceeding
  const handleUsernameNext = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setEmailChecking(true);
    try {
      const res = await fetch(`${API_URL}/api/check-username/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-CSRFToken": csrfToken },
        body: JSON.stringify({ username }),
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        if (data.exists) {
          setStep(2);
        } else {
          setError("This username is not registered. Please check and try again.");
        }
      } else {
        setError("Failed to verify username. Please try again.");
      }
    } catch {
      setError("Network error. Please try again.");
    }
    setEmailChecking(false);
  };

  // Handle password step: authenticate user with username and password
  const handlePasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/session-login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-CSRFToken": csrfToken },
        body: JSON.stringify({ username, password }),
        credentials: "include",
      });
      if (res.ok) {
        await login(); // Fetch user and set in context
      } else {
        setError("Invalid username or password.");
      }
    } catch {
      setError("Network error. Please try again.");
    }
    setLoading(false);
  };

  // Handle forgot password: send reset link to email
  async function handleForgotSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setForgotError("");
    setForgotSent(false);
    setLoading(true);
    try {
      // POST to backend to trigger password reset email
      const res = await fetch(`${API_URL}/api/forgot-password/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-CSRFToken": csrfToken },
        body: JSON.stringify({ email: forgotEmail }),
        credentials: "include",
      });
      if (res.ok) {
        setForgotSent(true);
      } else {
        setForgotError("Failed to send reset email. Please try again.");
      }
    } catch {
      setForgotError("Network error. Please try again.");
    }
    setLoading(false);
  }

  // Show loading spinner while auth state is being determined
  if (authLoading) {
    return <LoadingPage />;
  }
  if (user) {
    // If user is already logged in, redirect to dashboard
    // if (typeof window !== "undefined") {
    //   redirect("/start/dashboard");
    // }
    return <LoadingPage />;
  }

  // Render login UI: username step, password step, or forgot password
  return (
    <div
      className="min-h-screen flex flex-col bg-white font-sans"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      {/* Navigation bar at the top */}
      <NavBar />
      <main className="flex-1 flex items-center justify-center w-full px-4">
        <div className="w-full max-w-md bg-gray-50 p-6 sm:p-10 rounded-2xl shadow-xl border mx-auto">
          {/* Step 1: Enter Username */}
          {step === 1 && !showForgot && (
            <>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-center mb-2">
                Enter Your Username
              </h1>
              <p className="text-center text-gray-600 mb-6 sm:mb-8 text-sm sm:text-base">
                We&apos;ll check if you have an account with us.
              </p>
              <form onSubmit={handleUsernameNext} className="space-y-4 sm:space-y-6">
                <div>
                  <label className="block font-semibold mb-1 text-sm sm:text-base">Username</label>
                  <input
                    type="text"
                    placeholder="e.g. johndoe"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="w-full p-3 sm:p-2 border rounded focus:outline-none focus:ring-2 focus:ring-black text-base"
                    autoComplete="username"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-black text-white py-3 rounded font-semibold text-base sm:text-lg hover:bg-gray-900 transition"
                  disabled={!username || loading || emailChecking}
                >
                  {emailChecking ? "Checking..." : "Next"}
                </button>
                {/* Show error if username is not registered or request fails */}
                {error && (
                  <p className="text-red-600 text-center font-medium mt-4 text-sm sm:text-base">
                    {error}
                  </p>
                )}
              </form>
            </>
          )}
          {/* Step 2: Enter Password */}
          {step === 2 && !showForgot && (
            <>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-center mb-6 sm:mb-8 text-black">
                Enter Your Password
              </h1>
              <form
                onSubmit={handlePasswordSubmit}
                className="flex flex-col gap-4 sm:gap-6"
              >
                <div className="flex flex-col items-center mb-2">
                  <div className="w-full flex justify-center">
                    <div className="w-full max-w-xs flex flex-col items-center gap-2">
                      {/* User icon and username display */}
                      <span className="material-symbols-outlined text-gray-500 text-3xl sm:text-4xl">
                        account_circle
                      </span>
                      <p className="text-sm sm:text-base text-gray-600 text-center">
                        Logging in as{" "}
                        <span className="font-semibold text-black">{username}</span>
                      </p>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-sm sm:text-base">Password</label>
                  <input
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full p-3 sm:p-2 border rounded focus:outline-none focus:ring-2 focus:ring-black text-base"
                    autoComplete="current-password"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-black text-white py-3 rounded font-semibold text-base sm:text-lg hover:bg-gray-900 transition"
                  disabled={!password || loading}
                >
                  {loading ? "Signing In..." : "Sign In"}
                </button>
                {/* Show error if login fails */}
                {error && (
                  <p className="text-red-600 text-center font-medium mt-4 text-sm sm:text-base">
                    {error}
                  </p>
                )}
                {/* Forgot password link */}
                <button
                  type="button"
                  onClick={() => setShowForgot(true)}
                  className="text-gray-600 hover:text-black transition text-sm sm:text-base"
                >
                  Forgot your password?
                </button>
                {/* Back to username step */}
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-gray-600 hover:text-black transition text-sm sm:text-base"
                >
                  ← Back to username
                </button>
              </form>
            </>
          )}
          {/* Forgot Password */}
          {showForgot && (
            <>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-center mb-2">
                Reset Password
              </h1>
              <p className="text-center text-gray-600 mb-6 sm:mb-8 text-sm sm:text-base">
                Enter your email address and we&apos;ll send you a reset link.
              </p>
              <form onSubmit={handleForgotSubmit} className="space-y-4 sm:space-y-6">
                <div>
                  <label className="block font-semibold mb-1 text-sm sm:text-base">Email Address</label>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    required
                    className="w-full p-3 sm:p-2 border rounded focus:outline-none focus:ring-2 focus:ring-black text-base"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-black text-white py-3 rounded font-semibold text-base sm:text-lg hover:bg-gray-900 transition"
                  disabled={!forgotEmail || loading}
                >
                  {loading ? "Sending..." : "Send Reset Link"}
                </button>
                {forgotSent && (
                  <p className="text-green-700 text-center font-medium mt-4 text-sm sm:text-base">
                    Reset link sent! Check your email.
                  </p>
                )}
                {forgotError && (
                  <p className="text-red-600 text-center font-medium mt-4 text-sm sm:text-base">
                    {forgotError}
                  </p>
                )}
                {/* Back to login */}
                <button
                  type="button"
                  onClick={() => {
                    setShowForgot(false);
                    setForgotEmail("");
                    setForgotSent(false);
                    setForgotError("");
                  }}
                  className="text-gray-600 hover:text-black transition text-sm sm:text-base"
                >
                  ← Back to login
                </button>
              </form>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
