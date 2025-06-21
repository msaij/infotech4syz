"use client";
import { useState, useEffect } from "react";
import NavBar from "@/components/NavBar";
import Footer from "../components/Footer";
import { useRouter } from "next/navigation";

export default function Contact() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [zip, setZip] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [csrfToken, setCsrfToken] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const cookies = document.cookie.split(";").map((c) => c.trim());
      const sessionCookie = cookies.find((c) => c.startsWith("sessionid="));
      if (sessionCookie) {
        router.replace("/start/dashboard");
        return;
      }
    }
    fetch("http://127.0.0.1:8000/api/csrf/", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setCsrfToken(data.csrfToken))
      .catch(() => {});
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitted(false);
    try {
      const res = await fetch("http://127.0.0.1:8000/api/contact/", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-CSRFToken": csrfToken },
        body: JSON.stringify({ name, phone, email, city, zip, message }),
        credentials: "include",
      });
      if (res.ok) {
        setSubmitted(true);
        setName("");
        setPhone("");
        setEmail("");
        setCity("");
        setZip("");
        setMessage("");
      } else {
        setError("Submission failed. Please try again.");
      }
    } catch {
      setError("Network error. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-black">
      <NavBar />
      <div className="flex-1 flex flex-col items-center justify-center py-10 px-2">
        <h1 className="text-5xl font-extrabold text-center mt-6 mb-2">
          Contact Us
        </h1>
        <p className="text-lg text-gray-600 text-center mb-10">
          We're here to assist. Reach out with your requirements or inquiries.
        </p>
        <div className="w-full max-w-2xl bg-gray-50 p-8 rounded-2xl shadow-lg border mx-auto">
          <h2 className="text-2xl font-bold mb-1">Send Us a Message</h2>
          <p className="text-gray-600 mb-6">
            Fill out the form below, and we'll be in touch promptly.
          </p>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block font-semibold mb-1">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Phone Number</label>
                <input
                  type="text"
                  placeholder="e.g. (123) 456-7890"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
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
              <div>
                <label className="block font-semibold mb-1">Zip Code</label>
                <input
                  type="text"
                  placeholder="e.g. 98765"
                  value={zip}
                  onChange={(e) => setZip(e.target.value)}
                  required
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block font-semibold mb-1">City</label>
                <input
                  type="text"
                  placeholder="e.g. Metropolis"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block font-semibold mb-1">Your Message</label>
                <textarea
                  placeholder="Please describe your needs or inquiry..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-black"
                  rows={4}
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-black text-white py-3 rounded font-semibold text-lg hover:bg-gray-900 transition"
            >
              Send Message
            </button>
            {submitted && (
              <p className="text-green-700 text-center font-medium mt-4">
                Thank you for contacting us!
              </p>
            )}
            {error && (
              <p className="text-red-600 text-center font-medium mt-4">
                {error}
              </p>
            )}
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
}
