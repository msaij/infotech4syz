// LoginPage component for user authentication
// Handles email verification, password entry, and forgot password flow

"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { useAuth } from "@/components/(access-providers)/auth-context";

// Utility function to validate email format
function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Utility function to get auth token from context or localStorage
function getAuthToken() {
  if (typeof window !== "undefined") {
    return localStorage.getItem("authToken");
  }
  return null;
}

// Example: fetch user profile using token authentication (now uses authFetch)
// (Used for auto-login if token is present)
async function fetchUserProfile() {
  const res = await authFetch(`${API_URL}/api/users/me/`, {
    method: "GET",
  });
  if (res.ok) {
    return await res.json();
  }
  return null;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function LoginPage() {
  // State variables for login steps, form fields, and errors
  const [step, setStep] = useState(1); // 1: email, 2: password
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSent, setForgotSent] = useState(false);
  const [forgotError, setForgotError] = useState("");
  const [emailChecking, setEmailChecking] = useState(false);
  const [csrfToken, setCsrfToken] = useState("");
  const router = useRouter();
  const { login, authFetch, user, loading: authLoading } = useAuth();

  // Prevent access to /login if already authenticated
  useEffect(() => {
    if (!authLoading && user) {
      router.replace("/start/dashboard");
    }
  }, [user, authLoading, router]);

  // On mount: if a valid token exists, auto-login and redirect to dashboard
  useEffect(() => {
    if (!authLoading && !user) {
      async function checkUserProfile() {
        const token = getAuthToken();
        if (token) {
          // Use authFetch from context to include the token in the request
          const res = await authFetch(`${API_URL}/api/users/me/`, { method: "GET" });
          if (res.ok) {
            const user = await res.json();
            login(token, user); // Set user in context
            router.replace("/start/dashboard");
          } else {
            // Token is invalid or expired, remove it
            localStorage.removeItem("authToken");
          }
        }
      }
      checkUserProfile();
    }
  }, [authLoading, user, authFetch, router, login]);

  // Handle email step: verify if email exists before proceeding
  const handleEmailNext = async (e) => {
    e.preventDefault();
    setError("");
    setEmailChecking(true);
    try {
      // POST to backend to check if email exists (for user feedback)
      const res = await fetch(`${API_URL}/api/check-email/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-CSRFToken": csrfToken },
        body: JSON.stringify({ email }),
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        if (data.exists) {
          setStep(2); // Proceed to password step
        } else {
          setError("This email is not registered. Please check and try again.");
        }
      } else {
        setError("Failed to verify email. Please try again.");
      }
    } catch {
      setError("Network error. Please try again.");
    }
    setEmailChecking(false);
  };

  // Handle password step: authenticate user with email and password
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      // POST to DRF's token auth endpoint
      const res = await fetch(`${API_URL}/api/api-token-auth/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-CSRFToken": csrfToken },
        body: JSON.stringify({ username: email, password }),
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        const token = data.token;
        // Fetch user profile
        const userRes = await fetch(`${API_URL}/api/users/me/`, {
          headers: { Authorization: `Token ${token}` },
        });
        if (userRes.ok) {
          const userData = await userRes.json();
          login(token, userData);
          router.replace("/start/dashboard");
        } else {
          setError("Failed to fetch user profile.");
        }
      } else {
        setError("Invalid email or password.");
      }
    } catch {
      setError("Network error. Please try again.");
    }
    setLoading(false);
  };

  // Handle forgot password: send reset link to email
  async function handleForgotSubmit(e) {
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

  // Render login UI: email step, password step, or forgot password
  return (
    <div
      className="min-h-screen flex flex-col bg-white font-sans"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      {/* Navigation bar at the top */}
      <NavBar />
      <main className="flex-1 flex items-center justify-center w-full">
        <div className="w-full max-w-md bg-gray-50 p-10 rounded-2xl shadow-xl border mx-auto">
          {/* Step 1: Enter Email */}
          {step === 1 && !showForgot && (
            <>
              <h1 className="text-3xl font-extrabold text-center mb-2">
                Enter Your Email
              </h1>
              <p className="text-center text-gray-600 mb-8">
                We'll check if you have an account with us.
              </p>
              <form onSubmit={handleEmailNext} className="space-y-6">
                <div>
                  <label className="block font-semibold mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="e.g. john.doe@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-black text-white py-3 rounded font-semibold text-lg hover:bg-gray-900 transition"
                  disabled={!validateEmail(email) || loading || emailChecking}
                >
                  {emailChecking ? "Checking..." : "Next"}
                </button>
                {/* Show error if email is not registered or request fails */}
                {error && (
                  <p className="text-red-600 text-center font-medium mt-4">
                    {error}
                  </p>
                )}
              </form>
            </>
          )}
          {/* Step 2: Enter Password */}
          {step === 2 && !showForgot && (
            <>
              <h1 className="text-3xl font-extrabold text-center mb-8 text-black">
                Enter Your Password
              </h1>
              <form
                onSubmit={handlePasswordSubmit}
                className="flex flex-col gap-6"
              >
                <div className="flex flex-col items-center mb-2">
                  <div className="w-full flex justify-center">
                    <div className="w-full max-w-xs flex flex-col items-center gap-2">
                      {/* User icon and email display */}
                      <span className="material-symbols-outlined text-gray-500 text-4xl">
                        account_circle
                      </span>
                      <input
                        type="email"
                        value={email}
                        disabled
                        className="w-full p-2 border rounded bg-gray-100 text-gray-900 text-center font-semibold shadow-sm cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-black">
                    Password
                  </label>
                  <input
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-black text-black bg-white"
                  />
                </div>
                <div className="flex items-center justify-between mb-2">
                  {/* Change Email and Forgot Password links */}
                  <button
                    type="button"
                    className="flex items-center text-sm font-medium text-black hover:underline"
                    onClick={() => setStep(1)}
                  >
                    <span className="mr-1">&#8592;</span> Change Email
                  </button>
                  <button
                    type="button"
                    className="text-sm text-blue-600 underline hover:text-blue-800"
                    onClick={() => setShowForgot(true)}
                  >
                    Forgot password?
                  </button>
                </div>
                <button
                  type="submit"
                  className="w-full bg-black text-white py-3 rounded font-semibold text-lg hover:bg-gray-900 transition"
                  disabled={loading}
                >
                  {loading ? "Logging in..." : "Login"}
                </button>
                {/* Show error if login fails */}
                {error && (
                  <p className="text-red-600 text-center font-medium mt-4">
                    {error}
                  </p>
                )}
              </form>
            </>
          )}
          {/* Forgot Password Step */}
          {showForgot && (
            <>
              <h1 className="text-2xl font-bold text-center mb-2">
                Reset Password
              </h1>
              <p className="text-center text-gray-600 mb-6">
                Enter your email to receive a reset link.
              </p>
              {forgotSent ? (
                <div className="text-green-700 text-center font-semibold mb-4">
                  If this email exists, a reset link has been sent.
                </div>
              ) : (
                <form onSubmit={handleForgotSubmit} className="flex flex-col gap-4">
                  <input
                    type="email"
                    placeholder="Enter your email address"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="border border-gray-300 rounded px-4 py-2 bg-white text-black"
                    required
                  />
                  <button
                    type="submit"
                    className={`bg-black text-white px-6 py-2 rounded font-semibold transition ${
                      !validateEmail(forgotEmail) || loading
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:bg-gray-900"
                    }`}
                    disabled={!validateEmail(forgotEmail) || loading}
                  >
                    {loading ? "Sending..." : "Send Reset Link"}
                  </button>
                  {/* Show error if reset fails */}
                  {forgotError && (
                    <div className="text-red-600 text-center">{forgotError}</div>
                  )}
                </form>
              )}
              <button
                type="button"
                className="text-xs text-gray-600 underline hover:text-black mt-4"
                onClick={() => setShowForgot(false)}
              >
                Back to login
              </button>
            </>
          )}
        </div>
      </main>
      {/* Footer at the bottom */}
      <Footer />
    </div>
  );
}
