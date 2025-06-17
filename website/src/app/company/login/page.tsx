// Import necessary modules and hooks
"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

// Main Component
export default function CompanyLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [step, setStep] = useState("email");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const response = await fetch("/api/company/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        router.push("/company/dashboard"); // Redirect to the dashboard on successful login
      } else {
        const data = await response.json();
        setErrorMessage(data.message || "Login failed.");
      }
    } catch (error) {
      setErrorMessage("An error occurred. Please try again later.");
    }
  };

  // Render email or password page based on step
  return (
    <div
      className="min-h-screen flex items-center justify-center bg-gray-100"
      style={{
        backgroundImage:
          "radial-gradient(circle, rgba(0,0,0,0.1) 1px, transparent 1px)",
        backgroundSize: "10px 10px",
        animation:
          step === "email"
            ? "moveDotsReverse 5s linear infinite"
            : "moveDots 5s linear infinite",
      }}
    >
      <div className="w-full max-w-md bg-white text-gray-800 rounded-lg shadow-lg p-8">
        {step === "email" ? (
          <EmailInputPage
            email={email}
            setEmail={setEmail}
            setStep={setStep}
          />
        ) : (
          <PasswordInputPage
            password={password}
            setPassword={setPassword}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            errorMessage={errorMessage}
            handleLogin={handleLogin}
            setStep={setStep}
          />
        )}
      </div>
      <style jsx>{`
        @keyframes moveDotsReverse {
          0% {
            background-position: 100px 100px;
          }
          100% {
            background-position: 0 0;
          }
        }
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

// Email Input Page Component
function EmailInputPage({ email, setEmail, setStep }: { email: string; setEmail: React.Dispatch<React.SetStateAction<string>>; setStep: React.Dispatch<React.SetStateAction<string>> }) {
  return (
    <>
      <div className="text-center mb-6">
        <div className="mx-auto w-12 h-12 mb-4 rounded-full bg-gray-300 flex items-center justify-center">
          <span className="material-symbols-rounded text-3xl text-gray-700">
            account_circle
          </span>
        </div>
        <h1 className="text-2xl font-semibold">COMPANY LOGIN</h1>
        <p className="text-sm text-gray-500">Use your account</p>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setStep("password");
        }}
        className="space-y-4"
      >
        <div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md border border-gray-300 bg-gray-50 text-gray-800 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="localpart@4syz.com"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white font-medium rounded-md py-2 hover:bg-blue-600 transition"
        >
          Next
        </button>
      </form>
    </>
  );
}

// Password Input Page Component
function PasswordInputPage({ password, setPassword, showPassword, setShowPassword, errorMessage, handleLogin, setStep }: {
  password: string;
  setPassword: React.Dispatch<React.SetStateAction<string>>;
  showPassword: boolean;
  setShowPassword: React.Dispatch<React.SetStateAction<boolean>>;
  errorMessage: string;
  handleLogin: (event: React.FormEvent<HTMLFormElement>) => void;
  setStep: React.Dispatch<React.SetStateAction<string>>;
}) {
  return (
    <>
      <div className="text-center mb-6">
        <div className="mx-auto w-12 h-12 mb-4 rounded-full bg-gray-300 flex items-center justify-center">
          <span className="material-symbols-rounded text-3xl text-gray-700">
            account_circle
          </span>
        </div>
        <h1 className="text-2xl font-semibold">COMPANY LOGIN</h1>
      </div>
      <form onSubmit={handleLogin} className="space-y-4">
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
        {errorMessage && (
          <div className="text-red-500 text-sm text-center">
            {errorMessage}
          </div>
        )}
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
        <button
          type="submit"
          className="w-full bg-blue-500 text-white font-medium rounded-md py-2 hover:bg-blue-600 transition"
        >
          Login
        </button>
      </form>
      <ForgotPasswordAndChangeEmail setStep={setStep} />
    </>
  );
}

// Forgot Password and Change Email Component
function ForgotPasswordAndChangeEmail({ setStep }: { setStep: React.Dispatch<React.SetStateAction<string>> }) {
  return (
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
  );
}
