"use client";
import { useState, useEffect } from "react";

export default function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [csrfToken, setCsrfToken] = useState("");

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/csrf/", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setCsrfToken(data.csrfToken))
      .catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitted(false);
    try {
      const res = await fetch("http://127.0.0.1:8000/api/contact/", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-CSRFToken": csrfToken },
        body: JSON.stringify({ name, email, message }),
        credentials: "include",
      });
      if (res.ok) {
        setSubmitted(true);
        setName("");
        setEmail("");
        setMessage("");
      } else {
        setError("Submission failed. Please try again.");
      }
    } catch {
      setError("Network error. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white text-black py-16 px-4">
      <div className="w-full max-w-lg bg-gray-100 p-8 rounded-lg shadow">
        <h1 className="text-3xl font-bold mb-6 text-center">Contact Us</h1>
        {submitted ? (
          <div className="text-center text-lg text-green-700 font-semibold">
            Thank you for reaching out! We will get back to you soon.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="Your Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border border-gray-300 rounded px-4 py-2 bg-white text-black"
              required
            />
            <input
              type="email"
              placeholder="Your Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border border-gray-300 rounded px-4 py-2 bg-white text-black"
              required
            />
            <textarea
              placeholder="Your Message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="border border-gray-300 rounded px-4 py-2 bg-white text-black min-h-[120px]"
              required
            />
            <button
              type="submit"
              className="bg-black text-white px-6 py-2 rounded hover:bg-gray-900 transition font-semibold"
            >
              Send Message
            </button>
            {error && <div className="text-red-600 text-center">{error}</div>}
          </form>
        )}
      </div>
    </div>
  );
}
