// Import necessary modules and hooks
"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  // State variables for managing email, password, error messages, and UI steps
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [step, setStep] = useState("email");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  // Function to handle login form submission
  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Mock login logic
    if (email === "user@example.com" && password === "password123") {
      router.push("/"); // Redirect to the homepage on successful login
    } else {
      setErrorMessage("Invalid email or password."); // Display error message on failure
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-gray-100"
      style={{
        backgroundImage:
          "radial-gradient(circle, rgba(0,0,0,0.1) 1px, transparent 1px)",
        backgroundSize: "10px 10px",
        animation: "moveDots 5s linear infinite",
      }}
    >
      {/* Login form container */}
      <div className="w-full max-w-md bg-white text-gray-800 rounded-lg shadow-lg p-8">
        {step === "email" ? (
          <>
            {/* Email input page */}
            <div className="text-center mb-6">
              <div className="mx-auto w-12 h-12 mb-4 rounded-full bg-gray-300 flex items-center justify-center">
                <span className="material-symbols-rounded text-3xl text-gray-700">
                  account_circle
                </span>
              </div>
              <h1 className="text-2xl font-semibold">Sign in</h1>
              <p className="text-sm text-gray-500">Use your account</p>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setStep("password"); // Move to the password input page
              }}
              className="space-y-4"
            >
              {/* Email input field */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Enter your email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-md border border-gray-300 bg-gray-50 text-gray-800 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="yoda@force.com"
                  required
                />
              </div>
              {/* Error message display */}
              {errorMessage && (
                <div className="text-red-500 text-sm text-center">
                  {errorMessage}
                </div>
              )}
              {/* Submit button */}
              <button
                type="submit"
                className="w-full bg-blue-500 text-white font-medium rounded-md py-2 hover:bg-blue-600 transition"
              >
                Next
              </button>
            </form>
          </>
        ) : (
          <>
            {/* Password input page */}
            <div className="text-center mb-6">
              <div className="mx-auto w-12 h-12 mb-4 rounded-full bg-gray-300 flex items-center justify-center">
                <span className="material-symbols-rounded text-3xl text-gray-700">
                  account_circle
                </span>
              </div>
              <h1 className="text-2xl font-semibold">Welcome</h1>
              <p className="text-sm text-gray-500">{email}</p>
            </div>
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Password input field */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Enter your password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-md border border-gray-300 bg-gray-50 text-gray-800 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your password"
                  required
                />
              </div>
              {/* Error message display */}
              {errorMessage && (
                <div className="text-red-500 text-sm text-center">
                  {errorMessage}
                </div>
              )}
              {/* Show password checkbox */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="show-password"
                  className="mr-2"
                  checked={showPassword}
                  onChange={(e) => setShowPassword(e.target.checked)}
                />
                <label htmlFor="show-password" className="text-sm">
                  Show password
                </label>
              </div>
              {/* Submit button */}
              <button
                type="submit"
                className="w-full bg-blue-500 text-white font-medium rounded-md py-2 hover:bg-blue-600 transition"
              >
                Login
              </button>
            </form>
            {/* Forgot password and Change email options */}
            <div className="flex justify-between mt-4">
              <button
                type="button"
                onClick={() => setStep("email")}
                className="text-sm text-blue-500 hover:underline"
              >
                Change email
              </button>
              <a
                href="#"
                className="text-sm text-blue-500 hover:underline"
              >
                Forgot password?
              </a>
            </div>
          </>
        )}
      </div>
      <style jsx>{`
        @keyframes moveDots {
          0% {
            background-position: 0 0;
          }
          100% {
            background-position: 100px 100px;
          }
        }
      `}</style>
    </div>
  );
}
