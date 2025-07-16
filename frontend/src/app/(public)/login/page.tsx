"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import NavBar from "@/components/navigation/SmartNavBar";
import Footer from "@/components/layout/Footer";
import { useAuth } from "@/components/access-providers/auth-context";
import LoadingPage from "@/components/layout/LoadingPage";

export default function LoginPage() {
  // State variables for login form and errors
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSent, setForgotSent] = useState(false);
  const [forgotError, setForgotError] = useState("");
  const { login, user, loading: authLoading } = useAuth();
  const router = useRouter();

  // Redirect if user is already logged in
  useEffect(() => {
    if (!authLoading && user) {
      if (user.user_type === 'company') {
        router.replace("/start/dashboard");
      } else {
        router.replace("/clients/dashboard");
      }
    }
  }, [user, authLoading, router]);

  // Handle login form submission
  const handleLoginSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    try {
      const success = await login(username, password);
      if (!success) {
        setError("Invalid username or password.");
      }
    } catch (error) {
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
      // TODO: Implement forgot password endpoint
      // For now, just show success message
      setForgotSent(true);
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
    return <LoadingPage />;
  }

  // Render login UI
  return (
    <div
      className="min-h-screen flex flex-col bg-white font-sans"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      {/* Navigation bar at the top */}
      <NavBar />
      <main className="flex-1 flex items-center justify-center w-full px-4">
        <div className="w-full max-w-md bg-gray-50 p-6 sm:p-10 rounded-2xl shadow-xl border mx-auto">
          {/* Login Form */}
          {!showForgot && (
            <>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-center mb-2">
                Sign In
              </h1>
              <p className="text-center text-gray-600 mb-6 sm:mb-8 text-sm sm:text-base">
                Enter your credentials to access your account.
              </p>
              <form onSubmit={handleLoginSubmit} className="space-y-4 sm:space-y-6">
                <div>
                  <label className="block font-semibold mb-1 text-sm sm:text-base">Username</label>
                  <input
                    type="text"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="w-full p-3 sm:p-2 border rounded focus:outline-none focus:ring-2 focus:ring-black text-base"
                    autoComplete="username"
                  />
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
                  disabled={!username || !password || loading}
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
